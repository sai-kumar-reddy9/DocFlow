"""
Phase 5 Redis Integration & Rate Limiting Automated Test Suite
"""
import io
import sys
import asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import engine
from app.models import Base
from app.core.redis import get_redis
from app.services.cache_service import build_user_documents_cache_key


async def run_redis_tests():
    print("=" * 75)
    print("Phase 5 — Redis Integration, Caching & Rate Limiting Test Suite")
    print("=" * 75)

    # Initialize fresh DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Reset Redis state
    redis_client = await get_redis()
    if redis_client:
        await redis_client.flushall()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:

        # -------------------------------------------------------------
        # TEST 1: Health Diagnostic & Redis Connection Check
        # -------------------------------------------------------------
        print("\n[TEST 1] System Health & Redis Diagnostic Endpoint (/health)")
        res_health = await ac.get("/health")
        assert res_health.status_code == 200, f"Health check failed: {res_health.text}"
        health_data = res_health.json()
        assert health_data["status"] == "ONLINE"
        assert health_data["database"]["status"] == "CONNECTED"
        assert "redis" in health_data
        assert health_data["redis"]["status"] == "CONNECTED"
        print(f"  [OK] Health check passed: Redis status = '{health_data['redis']['status']}' (Mode: {health_data['redis'].get('mode', 'N/A')})")

        # -------------------------------------------------------------
        # TEST 2: Cache Creation & Cache Retrieval Flow
        # -------------------------------------------------------------
        print("\n[TEST 2] Dashboard & Document List Caching (Cache MISS -> Database -> Cache HIT)")

        # 2a. Register & authenticate test user
        reg_res = await ac.post("/api/v1/auth/register", json={
            "email": "redistest@docflow.io",
            "password": "RedisPassword123!",
            "full_name": "Redis Test User"
        })
        assert reg_res.status_code == 201
        user_id = reg_res.json()["id"]

        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "redistest@docflow.io",
            "password": "RedisPassword123!"
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Upload a test file
        file_payload = {"file": ("report_v1.pdf", io.BytesIO(b"%PDF Mock Content"), "application/pdf")}
        up_res = await ac.post("/api/v1/documents/upload", files=file_payload, headers=headers)
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

        # Cache Key
        cache_key = build_user_documents_cache_key(user_id)

        # Ensure cache key doesn't exist prior to first GET request
        if redis_client:
            raw_cached_before = await redis_client.get(cache_key)
            assert raw_cached_before is None, "Cache should be empty before first GET request"

        # First GET Request -> Cache MISS -> Populates Redis
        res_get_1 = await ac.get("/api/v1/documents", headers=headers)
        assert res_get_1.status_code == 200
        assert res_get_1.json()["total"] == 1
        print("  [OK] GET /api/v1/documents (1st call: Cache MISS -> Queried DB -> Stored in Redis)")

        # Verify Redis key now exists and contains cached JSON string
        if redis_client:
            raw_cached_after = await redis_client.get(cache_key)
            assert raw_cached_after is not None, "Redis key must be populated after first GET request"
            print(f"  [OK] Verified Redis key '{cache_key}' populated with cached payload")

        # Second GET Request -> Cache HIT (retrieved directly from Redis)
        res_get_2 = await ac.get("/api/v1/documents", headers=headers)
        assert res_get_2.status_code == 200
        assert res_get_2.json() == res_get_1.json(), "Cached HIT response must exactly match DB response"
        print("  [OK] GET /api/v1/documents (2nd call: Cache HIT -> Returned directly from Redis)")

        # -------------------------------------------------------------
        # TEST 3: Cache Invalidation on Upload & Delete
        # -------------------------------------------------------------
        print("\n[TEST 3] Redis Cache Invalidation Flow")

        # 3a. Upload 2nd document -> Must trigger Cache Invalidation!
        file_payload_2 = {"file": ("notes_v2.txt", io.BytesIO(b"Text Notes"), "text/plain")}
        up_res_2 = await ac.post("/api/v1/documents/upload", files=file_payload_2, headers=headers)
        assert up_res_2.status_code == 201

        # Check Redis key was invalidated (deleted)
        if redis_client:
            cached_after_upload = await redis_client.get(cache_key)
            assert cached_after_upload is None, "Upload must invalidate (delete) existing Redis cache key"
            print("  [OK] Cache invalidated upon document upload: Redis key purged")

        # GET request after upload -> Repopulates fresh cache (now 2 total items)
        res_get_3 = await ac.get("/api/v1/documents", headers=headers)
        assert res_get_3.status_code == 200
        assert res_get_3.json()["total"] == 2
        print("  [OK] Fresh data fetched from DB & re-cached in Redis (Total items: 2)")

        # 3b. Delete document -> Must trigger Cache Invalidation again!
        del_res = await ac.delete(f"/api/v1/documents/{doc_id}", headers=headers)
        assert del_res.status_code == 200

        if redis_client:
            cached_after_del = await redis_client.get(cache_key)
            assert cached_after_del is None, "Delete must invalidate (delete) existing Redis cache key"
            print("  [OK] Cache invalidated upon document deletion: Redis key purged")

        # GET request after deletion -> Repopulates fresh cache (now 1 total item)
        res_get_4 = await ac.get("/api/v1/documents", headers=headers)
        assert res_get_4.status_code == 200
        assert res_get_4.json()["total"] == 1
        print("  [OK] Fresh data fetched from DB after deletion (Total items: 1)")

        # -------------------------------------------------------------
        # TEST 4: Redis Rate Limiting Enforcement (HTTP 429)
        # -------------------------------------------------------------
        print("\n[TEST 4] Redis Rate Limiting Enforcement")

        # 4a. Login Rate Limiting (Limit: 5 requests per 60s)
        # Reset login rate limit key for clean test
        if redis_client:
            await redis_client.delete("ratelimit:auth_login:127.0.0.1")
            await redis_client.delete("ratelimit:auth_login:testserver")

        login_attempts = 0
        rate_limit_triggered = False

        for i in range(1, 8):
            r = await ac.post("/api/v1/auth/login", json={"email": "redistest@docflow.io", "password": "WrongPassword!"})
            login_attempts += 1
            if r.status_code == 429:
                rate_limit_triggered = True
                print(f"  [OK] Login Rate Limiter triggered at request #{login_attempts} with HTTP 429 Too Many Requests")
                assert "Too many requests" in r.json()["detail"]
                break

        assert rate_limit_triggered, "Login rate limiter did not trigger HTTP 429 after max requests"

        # 4b. Document Upload Rate Limiting (Limit: 10 requests per 60s)
        if redis_client:
            await redis_client.delete("ratelimit:doc_upload:127.0.0.1")
            await redis_client.delete("ratelimit:doc_upload:testserver")

        upload_rate_triggered = False
        for i in range(1, 13):
            f_payload = {"file": (f"test_{i}.txt", io.BytesIO(b"Data"), "text/plain")}
            r_up = await ac.post("/api/v1/documents/upload", files=f_payload, headers=headers)
            if r_up.status_code == 429:
                upload_rate_triggered = True
                print(f"  [OK] Upload Rate Limiter triggered at request #{i} with HTTP 429 Too Many Requests")
                break

        assert upload_rate_triggered, "Upload rate limiter did not trigger HTTP 429 after max requests"

    print("\n" + "=" * 75)
    print("ALL PHASE 5 REDIS INTEGRATION & RATE LIMITING TESTS PASSED SUCCESSFULLY!")
    print("=" * 75)


if __name__ == "__main__":
    asyncio.run(run_redis_tests())
