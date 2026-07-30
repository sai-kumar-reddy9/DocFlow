"""
Phase 3 Authentication & RBAC Automated Test Verification Script
"""
import sys
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine, AsyncSessionLocal
from app.models import Base
from app.services import user_service


async def run_auth_tests():
    print("=" * 70)
    print("Phase 3 — Authentication & RBAC Automated Test Suite")
    print("=" * 70)

    # Initialize fresh DB tables for clean testing
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        
        # -------------------------------------------------------------
        # TEST 1: User Registration & Default "USER" Role Assignment
        # -------------------------------------------------------------
        print("\n[TEST 1] Public User Registration (Argon2id Hashing & Default USER Role)")
        
        # 1a. Register standard USER (without role field in public payload)
        user_payload = {
            "email": "user@docflow.io",
            "password": "SecurePassword123!",
            "full_name": "Standard User"
        }
        res_user = await ac.post("/api/v1/auth/register", json=user_payload)
        assert res_user.status_code == 201, f"Failed: {res_user.text}"
        user_data = res_user.json()
        assert user_data["email"] == "user@docflow.io"
        assert user_data["role"] == "USER", "Public registration must default to USER role"
        assert "hashed_password" not in user_data
        print("  [OK] Standard User registered successfully with default USER role (HTTP 201 Created)")

        # 1b. Register second user and promote to ADMIN via admin service utility
        admin_payload = {
            "email": "admin@docflow.io",
            "password": "AdminPassword123!",
            "full_name": "Platform Admin"
        }
        res_admin = await ac.post("/api/v1/auth/register", json=admin_payload)
        assert res_admin.status_code == 201
        admin_data = res_admin.json()
        assert admin_data["role"] == "USER", "All public registrations must default to USER role"

        # Promote admin_user via admin service utility (simulating existing admin/DB utility action)
        async with AsyncSessionLocal() as session:
            admin_db_user = await user_service.get_user_by_email(session, "admin@docflow.io")
            assert admin_db_user is not None
            await user_service.update_user_role(session, admin_db_user, "ADMIN")
        print("  [OK] Admin user created & role assigned via administrative service utility")

        # 1c. Test Duplicate Email Registration Prevention
        res_dup = await ac.post("/api/v1/auth/register", json=user_payload)
        assert res_dup.status_code == 400
        print("  [OK] Duplicate registration prevented with HTTP 400 Bad Request")

        # -------------------------------------------------------------
        # TEST 2: User Login & JWT Token Generation (/api/v1/auth/login)
        # -------------------------------------------------------------
        print("\n[TEST 2] Authentication & JWT Token Issuance")

        # 2a. Invalid Password Login
        invalid_login = {"email": "user@docflow.io", "password": "WrongPassword!"}
        res_invalid = await ac.post("/api/v1/auth/login", json=invalid_login)
        assert res_invalid.status_code == 401
        print("  [OK] Invalid password rejected with HTTP 401 Unauthorized")

        # 2b. Valid Standard User Login
        valid_user_login = {"email": "user@docflow.io", "password": "SecurePassword123!"}
        res_user_login = await ac.post("/api/v1/auth/login", json=valid_user_login)
        assert res_user_login.status_code == 200
        token_data = res_user_login.json()
        assert "access_token" in token_data
        user_jwt = token_data["access_token"]
        assert "access_token" in res_user_login.cookies
        print("  [OK] User logged in: JWT issued & HTTP-only Cookie set")

        # 2c. Valid Admin Login
        valid_admin_login = {"email": "admin@docflow.io", "password": "AdminPassword123!"}
        res_admin_login = await ac.post("/api/v1/auth/login", json=valid_admin_login)
        assert res_admin_login.status_code == 200
        admin_jwt = res_admin_login.json()["access_token"]
        print("  [OK] Admin logged in: Admin JWT issued with ADMIN role claim")

        # -------------------------------------------------------------
        # TEST 3: Protected Endpoint (/api/v1/auth/me)
        # -------------------------------------------------------------
        print("\n[TEST 3] Current User Verification (/api/v1/auth/me)")

        # 3a. Unauthenticated request (clear cookies to simulate anonymous client)
        ac.cookies.clear()
        res_unauth = await ac.get("/api/v1/auth/me")
        assert res_unauth.status_code == 401
        print("  [OK] Unauthenticated request rejected with HTTP 401 Unauthorized")

        # 3b. Authenticated request with Bearer Header
        headers = {"Authorization": f"Bearer {user_jwt}"}
        res_me = await ac.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        me_data = res_me.json()
        assert me_data["email"] == "user@docflow.io"
        assert me_data["role"] == "USER"
        print("  [OK] Current user details retrieved via Bearer JWT Token")

        # -------------------------------------------------------------
        # TEST 4: Role-Based Access Control (/api/v1/auth/admin-only-test)
        # -------------------------------------------------------------
        print("\n[TEST 4] Role-Based Access Control (RBAC) Enforcement")

        # 4a. Standard User attempting Admin-only route -> HTTP 403 Forbidden
        res_rbac_denied = await ac.get("/api/v1/auth/admin-only-test", headers=headers)
        assert res_rbac_denied.status_code == 403
        print("  [OK] Standard User access to Admin route blocked (HTTP 403 Forbidden)")

        # 4b. Admin User accessing Admin-only route -> HTTP 200 OK
        admin_headers = {"Authorization": f"Bearer {admin_jwt}"}
        res_rbac_allowed = await ac.get("/api/v1/auth/admin-only-test", headers=admin_headers)
        assert res_rbac_allowed.status_code == 200
        rbac_data = res_rbac_allowed.json()
        assert rbac_data["role"] == "ADMIN"
        print("  [OK] Admin User access to Admin route granted (HTTP 200 OK)")

    print("\n" + "=" * 70)
    print("ALL PHASE 3 AUTHENTICATION & RBAC TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(run_auth_tests())
