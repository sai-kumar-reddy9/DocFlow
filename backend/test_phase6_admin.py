"""
Phase 6 Admin Module & Analytics Automated Test Suite
"""
import io
import sys
import asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import engine, AsyncSessionLocal
from app.models import Base
from app.services import user_service
from app.core.redis import get_redis


async def run_admin_tests():
    print("=" * 75)
    print("Phase 6 — Admin Module & Analytics Automated Test Suite")
    print("=" * 75)

    # Re-initialize DB tables for clean testing
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Flush Redis state
    redis_client = await get_redis()
    if redis_client:
        await redis_client.flushall()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:

        # -------------------------------------------------------------
        # SETUP: Create Standard User A and Admin User B
        # -------------------------------------------------------------
        print("\n[SETUP] Creating Standard User and Admin User...")
        
        # 1. Register Standard User
        res_std = await ac.post("/api/v1/auth/register", json={
            "email": "user@docflow.io", "password": "UserPassword123!", "full_name": "Standard User"
        })
        assert res_std.status_code == 201
        std_user_id = res_std.json()["id"]

        login_std = await ac.post("/api/v1/auth/login", json={"email": "user@docflow.io", "password": "UserPassword123!"})
        std_token = login_std.json()["access_token"]
        std_headers = {"Authorization": f"Bearer {std_token}"}

        ac.cookies.clear()

        # 2. Register Admin User and promote via DB service utility
        res_adm = await ac.post("/api/v1/auth/register", json={
            "email": "admin@docflow.io", "password": "AdminPassword123!", "full_name": "System Admin"
        })
        assert res_adm.status_code == 201
        adm_user_id = res_adm.json()["id"]

        async with AsyncSessionLocal() as session:
            db_adm = await user_service.get_user_by_email(session, "admin@docflow.io")
            assert db_adm is not None
            await user_service.update_user_role(session, db_adm, "ADMIN")

        login_adm = await ac.post("/api/v1/auth/login", json={"email": "admin@docflow.io", "password": "AdminPassword123!"})
        adm_token = login_adm.json()["access_token"]
        adm_headers = {"Authorization": f"Bearer {adm_token}"}

        print("  [OK] Standard User and Admin User initialized successfully")

        # -------------------------------------------------------------
        # TEST 1: Role-Based Access Control Enforcement (RBAC)
        # -------------------------------------------------------------
        print("\n[TEST 1] Role-Based Access Control Enforcement (RBAC)")

        # Standard User attempting Admin endpoints -> HTTP 403 Forbidden
        res_rbac_users = await ac.get("/api/v1/admin/users", headers=std_headers)
        assert res_rbac_users.status_code == 403
        print("  [OK] Standard User listing users blocked with HTTP 403 Forbidden")

        res_rbac_analytics = await ac.get("/api/v1/admin/analytics", headers=std_headers)
        assert res_rbac_analytics.status_code == 403
        print("  [OK] Standard User viewing admin analytics blocked with HTTP 403 Forbidden")

        res_rbac_logs = await ac.get("/api/v1/admin/activity-logs", headers=std_headers)
        assert res_rbac_logs.status_code == 403
        print("  [OK] Standard User viewing activity logs blocked with HTTP 403 Forbidden")

        # -------------------------------------------------------------
        # TEST 2: Admin User Management & Status / Role Operations
        # -------------------------------------------------------------
        print("\n[TEST 2] Admin User Management Operations")

        # 2a. Admin list all users
        res_users = await ac.get("/api/v1/admin/users", headers=adm_headers)
        assert res_users.status_code == 200
        users_list = res_users.json()
        assert users_list["total"] == 2
        print("  [OK] Admin fetched all registered users with document & storage stats")

        # 2b. View user details
        res_detail = await ac.get(f"/api/v1/admin/users/{std_user_id}", headers=adm_headers)
        assert res_detail.status_code == 200
        assert res_detail.json()["email"] == "user@docflow.io"
        print("  [OK] Admin fetched specific user details")

        # 2c. Disable user account -> HTTP 200
        res_disable = await ac.patch(f"/api/v1/admin/users/{std_user_id}/status", json={"is_active": False}, headers=adm_headers)
        assert res_disable.status_code == 200
        assert res_disable.json()["is_active"] is False
        print("  [OK] Admin disabled user account")

        # Verify disabled user cannot log in -> HTTP 403 Forbidden
        res_dis_login = await ac.post("/api/v1/auth/login", json={"email": "user@docflow.io", "password": "UserPassword123!"})
        assert res_dis_login.status_code == 403
        print("  [OK] Disabled user login rejected with HTTP 403 Forbidden")

        # Re-enable user account
        res_enable = await ac.patch(f"/api/v1/admin/users/{std_user_id}/status", json={"is_active": True}, headers=adm_headers)
        assert res_enable.status_code == 200
        assert res_enable.json()["is_active"] is True
        print("  [OK] Admin re-enabled user account")

        # -------------------------------------------------------------
        # TEST 3: Document Uploads & System-wide Document Overview
        # -------------------------------------------------------------
        print("\n[TEST 3] Document Uploads & System-Wide Document Overview")

        # Upload files from Standard User
        f1 = {"file": ("report.pdf", io.BytesIO(b"%PDF Data"), "application/pdf")}
        r_up1 = await ac.post("/api/v1/documents/upload", files=f1, headers=std_headers)
        assert r_up1.status_code == 201

        f2 = {"file": ("data.docx", io.BytesIO(b"Docx Data"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        r_up2 = await ac.post("/api/v1/documents/upload", files=f2, headers=std_headers)
        assert r_up2.status_code == 201

        # Admin lists all system documents
        res_admin_docs = await ac.get("/api/v1/admin/documents", headers=adm_headers)
        assert res_admin_docs.status_code == 200
        assert res_admin_docs.json()["total"] == 2
        print("  [OK] Admin listed system-wide documents across all users")

        # -------------------------------------------------------------
        # TEST 4: Analytics Endpoints & Redis Caching
        # -------------------------------------------------------------
        print("\n[TEST 4] Admin & User Dashboard Analytics (Redis Cached)")

        # 4a. Query Admin Analytics
        res_an = await ac.get("/api/v1/admin/analytics", headers=adm_headers)
        assert res_an.status_code == 200
        an_data = res_an.json()
        assert an_data["overview"]["total_users"] == 2
        assert an_data["overview"]["total_documents"] == 2
        assert len(an_data["upload_trend"]) == 7
        assert len(an_data["file_type_distribution"]) >= 2
        assert len(an_data["user_role_distribution"]) == 2
        print("  [OK] Admin Analytics returned total users, documents, 7-day upload trend, file format, and user role metrics")

        # 4b. Query User Dashboard Stats
        res_u_stats = await ac.get("/api/v1/dashboard/user-stats", headers=std_headers)
        assert res_u_stats.status_code == 200
        u_data = res_u_stats.json()
        assert u_data["total_files"] == 2
        assert len(u_data["uploads_7_days"]) == 7
        assert u_data["storage_limit_bytes"] == 5 * 1024 * 1024 * 1024
        print("  [OK] User Dashboard Stats returned 7-day upload trend, format breakdown, and storage quota")

        # -------------------------------------------------------------
        # TEST 5: System Activity Audit Logs
        # -------------------------------------------------------------
        print("\n[TEST 5] System Activity Audit Logging")

        res_logs = await ac.get("/api/v1/admin/activity-logs", headers=adm_headers)
        assert res_logs.status_code == 200
        logs_data = res_logs.json()
        assert logs_data["total"] >= 5
        recorded_actions = [log["action"] for log in logs_data["items"]]
        assert "USER_REGISTERED" in recorded_actions
        assert "USER_LOGIN" in recorded_actions
        assert "DOCUMENT_UPLOADED" in recorded_actions
        assert "USER_DISABLED" in recorded_actions
        print(f"  [OK] Verified audit logging: Recorded actions = {list(set(recorded_actions))}")

    print("\n" + "=" * 75)
    print("ALL PHASE 6 ADMIN MODULE & ANALYTICS TESTS PASSED SUCCESSFULLY!")
    print("=" * 75)


if __name__ == "__main__":
    asyncio.run(run_admin_tests())
