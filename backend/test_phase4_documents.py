"""
Phase 4 Document Management & File Upload Automated Test Suite
"""
import os
import sys
import io
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine
from app.models import Base, Document
from app.services.document_service import UPLOAD_DIR


async def run_document_tests():
    print("=" * 75)
    print("Phase 4 — Document Management & File Upload Automated Test Suite")
    print("=" * 75)

    # Re-initialize DB tables for clean test execution
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:

        # -------------------------------------------------------------
        # STEP 0: Setup User A and User B accounts & obtaining JWT tokens
        # -------------------------------------------------------------
        print("\n[SETUP] Creating User A and User B accounts...")
        res_a = await ac.post("/api/v1/auth/register", json={
            "email": "usera@docflow.io", "password": "UserAPassword123!", "full_name": "User Alpha"
        })
        assert res_a.status_code == 201
        res_a_login = await ac.post("/api/v1/auth/login", json={"email": "usera@docflow.io", "password": "UserAPassword123!"})
        token_a = res_a_login.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        ac.cookies.clear()

        res_b = await ac.post("/api/v1/auth/register", json={
            "email": "userb@docflow.io", "password": "UserBPassword123!", "full_name": "User Beta"
        })
        assert res_b.status_code == 201
        res_b_login = await ac.post("/api/v1/auth/login", json={"email": "userb@docflow.io", "password": "UserBPassword123!"})
        token_b = res_b_login.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        print("  [OK] User A and User B authenticated successfully")

        # -------------------------------------------------------------
        # TEST 1: Upload Valid Document Formats (PDF, DOCX, TXT)
        # -------------------------------------------------------------
        print("\n[TEST 1] Uploading Valid File Formats (PDF, DOCX, TXT)")

        # 1a. Upload PDF
        pdf_content = b"%PDF-1.4 Mock PDF Content for testing upload pipeline"
        files_pdf = {"file": ("report_q3.pdf", io.BytesIO(pdf_content), "application/pdf")}
        res_pdf = await ac.post("/api/v1/documents/upload", files=files_pdf, headers=headers_a)
        assert res_pdf.status_code == 201, f"Failed: {res_pdf.text}"
        doc_pdf = res_pdf.json()
        assert doc_pdf["original_filename"] == "report_q3.pdf"
        assert doc_pdf["file_extension"] == ".pdf"
        assert doc_pdf["mime_type"] == "application/pdf"
        pdf_id = doc_pdf["id"]
        pdf_stored_name = doc_pdf["stored_filename"]
        assert os.path.exists(os.path.join(UPLOAD_DIR, pdf_stored_name))
        print("  [OK] PDF uploaded successfully: Metadata saved in DB & File written to backend/uploads/")

        # 1b. Upload DOCX
        docx_content = b"PK\x03\x04 Mock DOCX zip structure content"
        files_docx = {"file": ("contract.docx", io.BytesIO(docx_content), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        res_docx = await ac.post("/api/v1/documents/upload", files=files_docx, headers=headers_a)
        assert res_docx.status_code == 201
        doc_docx = res_docx.json()
        assert doc_docx["file_extension"] == ".docx"
        print("  [OK] DOCX uploaded successfully")

        # 1c. Upload TXT
        txt_content = b"Plain text memo content for testing upload service"
        files_txt = {"file": ("notes.txt", io.BytesIO(txt_content), "text/plain")}
        res_txt = await ac.post("/api/v1/documents/upload", files=files_txt, headers=headers_a)
        assert res_txt.status_code == 201
        doc_txt = res_txt.json()
        assert doc_txt["file_extension"] == ".txt"
        print("  [OK] TXT uploaded successfully")

        # -------------------------------------------------------------
        # TEST 2: Reject Unsafe & Oversized Files
        # -------------------------------------------------------------
        print("\n[TEST 2] File Validation & Security Checks")

        # 2a. Reject EXE / Unsafe file format -> HTTP 415
        exe_content = b"MZ\x90\x00 Mock executable binary"
        files_exe = {"file": ("malicious.exe", io.BytesIO(exe_content), "application/x-msdownload")}
        res_exe = await ac.post("/api/v1/documents/upload", files=files_exe, headers=headers_a)
        assert res_exe.status_code == 415
        print("  [OK] Dangerous extension (.exe) rejected with HTTP 415 Unsupported Media Type")

        # 2b. Reject Oversized file (>10 MB) -> HTTP 413
        large_content = b"0" * (10 * 1024 * 1024 + 100)  # > 10MB
        files_large = {"file": ("large_video.pdf", io.BytesIO(large_content), "application/pdf")}
        res_large = await ac.post("/api/v1/documents/upload", files=files_large, headers=headers_a)
        assert res_large.status_code == 413
        print("  [OK] Oversized file (>10MB) rejected with HTTP 413 Payload Too Large")

        # -------------------------------------------------------------
        # TEST 3: User Document Listing & Isolation
        # -------------------------------------------------------------
        print("\n[TEST 3] User Document Listing & Data Isolation")

        # 3a. User A lists documents (should see 3 items)
        res_list_a = await ac.get("/api/v1/documents", headers=headers_a)
        assert res_list_a.status_code == 200
        list_a = res_list_a.json()
        assert list_a["total"] == 3
        print("  [OK] User A document list returns exactly 3 owned files")

        # 3b. User B lists documents (should see 0 items)
        res_list_b = await ac.get("/api/v1/documents", headers=headers_b)
        assert res_list_b.status_code == 200
        list_b = res_list_b.json()
        assert list_b["total"] == 0
        print("  [OK] User B document list returns 0 files (Data Isolation Verified)")

        # -------------------------------------------------------------
        # TEST 4: Access Control & Authorization Checks
        # -------------------------------------------------------------
        print("\n[TEST 4] Ownership Access Control Enforcement")

        # 4a. User B attempting to view User A's document details -> HTTP 403 Forbidden
        res_get_unauth = await ac.get(f"/api/v1/documents/{pdf_id}", headers=headers_b)
        assert res_get_unauth.status_code == 403
        print("  [OK] User B access to User A's document metadata blocked (HTTP 403 Forbidden)")

        # 4b. User B attempting to download User A's document file -> HTTP 403 Forbidden
        res_dl_unauth = await ac.get(f"/api/v1/documents/{pdf_id}/download", headers=headers_b)
        assert res_dl_unauth.status_code == 403
        print("  [OK] User B download of User A's document file blocked (HTTP 403 Forbidden)")

        # 4c. User B attempting to delete User A's document -> HTTP 403 Forbidden
        res_del_unauth = await ac.delete(f"/api/v1/documents/{pdf_id}", headers=headers_b)
        assert res_del_unauth.status_code == 403
        print("  [OK] User B deletion of User A's document blocked (HTTP 403 Forbidden)")

        # -------------------------------------------------------------
        # TEST 5: Document Download & Deletion Execution
        # -------------------------------------------------------------
        print("\n[TEST 5] File Download & Deletion Execution")

        # 5a. User A downloads own PDF file
        res_dl = await ac.get(f"/api/v1/documents/{pdf_id}/download", headers=headers_a)
        assert res_dl.status_code == 200
        assert res_dl.content == pdf_content
        print("  [OK] User A successfully downloaded PDF file content")

        # 5b. User A deletes own PDF file
        res_del = await ac.delete(f"/api/v1/documents/{pdf_id}", headers=headers_a)
        assert res_del.status_code == 200
        assert not os.path.exists(os.path.join(UPLOAD_DIR, pdf_stored_name))
        print("  [OK] Document deleted: Physical file removed from disk & Metadata deleted from DB")

        # 5c. Confirm document no longer exists -> HTTP 404
        res_verify_del = await ac.get(f"/api/v1/documents/{pdf_id}", headers=headers_a)
        assert res_verify_del.status_code == 404
        print("  [OK] Subsequent query for deleted document returns HTTP 404 Not Found")

    print("\n" + "=" * 75)
    print("ALL PHASE 4 DOCUMENT MANAGEMENT & FILE UPLOAD TESTS PASSED SUCCESSFULLY!")
    print("=" * 75)


if __name__ == "__main__":
    asyncio.run(run_document_tests())
