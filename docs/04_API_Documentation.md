# 04 — API Documentation

Complete reference documentation for all FastAPI REST API endpoints. Base API URL: `http://localhost:8000/api/v1`

---

## 🔐 1. Authentication & RBAC Endpoints

### `POST /api/v1/auth/register`
Registers a new user account with Argon2id password hashing. Defaults to `USER` role.

- **Authentication Required**: No (Public)
- **Request Body** (`application/json`):
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "full_name": "John Doe"
  }
  ```
- **Responses**:
  - `HTTP 201 Created`: Returns created user object.
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "USER",
      "is_active": true,
      "created_at": "2026-08-01T12:00:00Z"
    }
    ```
  - `HTTP 400 Bad Request`: Email already registered.

---

### `POST /api/v1/auth/login`
Authenticates credentials, returns JWT bearer token, and attaches HTTP-only `access_token` cookie. Rate limited (5 requests/min per IP).

- **Authentication Required**: No (Protected by Redis Rate Limiter)
- **Request Body** (`application/json`):
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer"
    }
    ```
    *Header*: `Set-Cookie: access_token=eyJhbG...; HttpOnly; Path=/; SameSite=Lax`
  - `HTTP 401 Unauthorized`: Invalid email or password.
  - `HTTP 429 Too Many Requests`: Rate limit exceeded.

---

### `POST /api/v1/auth/logout`
Clears the HTTP-only `access_token` cookie.

- **Authentication Required**: No
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "message": "Successfully logged out."
  }
  ```

---

### `GET /api/v1/auth/me`
Fetches the profile details of the currently authenticated user.

- **Authentication Required**: Yes (Bearer Token or HTTP-only Cookie)
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "USER",
    "is_active": true,
    "created_at": "2026-08-01T12:00:00Z"
  }
  ```
- **Errors**: `HTTP 401 Unauthorized` if unauthenticated or token expired.

---

### `GET /api/v1/auth/admin-only-test`
Verification endpoint testing RBAC enforcement. Restrictive to `ADMIN` users.

- **Authentication Required**: Yes (`ADMIN` Role Required)
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "message": "Hello Administrator System Admin! You have verified RBAC authorization.",
    "admin_id": "1925bde9-d459-4f55-af8f-008473c818a3",
    "role": "ADMIN"
  }
  ```
- **Errors**: `HTTP 403 Forbidden` if authenticated user has `USER` role.

---

## 📄 2. Document Management Endpoints

### `POST /api/v1/documents/upload`
Uploads a document file (.pdf, .docx, .txt, <=10MB), stores on disk, inserts DB record, and invalidates Redis cache. Rate limited (10 uploads/min).

- **Authentication Required**: Yes (`USER` or `ADMIN`)
- **Request Body** (`multipart/form-data`):
  - `file`: Binary file stream
- **Responses**:
  - `HTTP 201 Created`:
    ```json
    {
      "id": "c1f7b8a0-4b21-4d92-91bf-52a12a550000",
      "original_filename": "Q3_Report.pdf",
      "stored_filename": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d.pdf",
      "file_size": 245820,
      "mime_type": "application/pdf",
      "file_extension": ".pdf",
      "created_at": "2026-08-02T14:30:00Z"
    }
    ```
  - `HTTP 400 Bad Request`: File type not allowed or size exceeds 10MB limit.
  - `HTTP 429 Too Many Requests`: Upload rate limit exceeded.

---

### `GET /api/v1/documents`
Retrieves all documents owned by requesting user. Cached in Redis (`documents:user:{id}`).

- **Authentication Required**: Yes
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "items": [
      {
        "id": "c1f7b8a0-4b21-4d92-91bf-52a12a550000",
        "original_filename": "Q3_Report.pdf",
        "stored_filename": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d.pdf",
        "file_size": 245820,
        "mime_type": "application/pdf",
        "file_extension": ".pdf",
        "created_at": "2026-08-02T14:30:00Z"
      }
    ],
    "total": 1
  }
  ```

---

### `GET /api/v1/documents/{document_id}`
Gets metadata for a single document. Enforces ownership access control.

- **Authentication Required**: Yes
- **Response** (`HTTP 200 OK`): Document metadata object.
- **Errors**:
  - `HTTP 404 Not Found`: Document ID does not exist.
  - `HTTP 403 Forbidden`: Document belongs to another user.

---

### `GET /api/v1/documents/{document_id}/download`
Streams physical document file content for download. Enforces ownership authorization.

- **Authentication Required**: Yes
- **Response** (`HTTP 200 OK`): File binary stream with `Content-Disposition: attachment`.
- **Errors**: `HTTP 403 Forbidden` if requested by non-owner.

---

### `DELETE /api/v1/documents/{document_id}`
Deletes physical file from disk, deletes DB record, and invalidates Redis user cache. Enforces ownership.

- **Authentication Required**: Yes
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "message": "Document successfully deleted."
  }
  ```
- **Errors**: `HTTP 403 Forbidden` if requested by non-owner.

---

## 📊 3. Dashboard Analytics Endpoints

### `GET /api/v1/dashboard/user-stats`
Returns user dashboard analytical metrics (7-day upload trend, format breakdown, storage usage). Cached in Redis (`dashboard:user:{id}`).

- **Authentication Required**: Yes
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "total_documents": 12,
    "total_storage_bytes": 15420000,
    "daily_uploads": [
      { "date": "2026-07-28", "count": 2 },
      { "date": "2026-07-29", "count": 1 },
      { "date": "2026-07-30", "count": 4 },
      { "date": "2026-07-31", "count": 0 },
      { "date": "2026-08-01", "count": 2 },
      { "date": "2026-08-02", "count": 3 },
      { "date": "2026-08-03", "count": 0 }
    ],
    "file_type_distribution": [
      { "extension": ".pdf", "count": 7 },
      { "extension": ".docx", "count": 3 },
      { "extension": ".txt", "count": 2 }
    ]
  }
  ```

---

## 🛠 4. Admin Module & Analytics Endpoints

### `GET /api/v1/admin/users`
Lists all registered users with file counts and storage metrics. Paginated.

- **Authentication Required**: Yes (`ADMIN` Only)
- **Query Parameters**: `skip` (default 0), `limit` (default 50)
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "items": [
      {
        "id": "1925bde9-d459-4f55-af8f-008473c818a3",
        "email": "admin@docflow.io",
        "full_name": "System Admin",
        "role": "ADMIN",
        "is_active": true,
        "created_at": "2026-07-28T00:00:00Z",
        "total_documents": 5,
        "total_storage_bytes": 8450000
      }
    ],
    "total": 1
  }
  ```

---

### `PATCH /api/v1/admin/users/{user_id}/status`
Enables or disables user account access. Enforces self and root admin protection.

- **Authentication Required**: Yes (`ADMIN` Only)
- **Request Body** (`application/json`):
  ```json
  { "is_active": false }
  ```
- **Responses**:
  - `HTTP 200 OK`: Updated User Detail object.
  - `HTTP 400 Bad Request`: Modifying active status of yourself or primary root administrator (`admin@docflow.io`) is restricted.

---

### `PATCH /api/v1/admin/users/{user_id}/role`
Updates user role (`USER` ↔ `ADMIN`). Enforces self and root admin protection.

- **Authentication Required**: Yes (`ADMIN` Only)
- **Request Body** (`application/json`):
  ```json
  { "role": "ADMIN" }
  ```
- **Responses**:
  - `HTTP 200 OK`: Updated User Detail object.
  - `HTTP 400 Bad Request`: Modifying role of yourself or primary root administrator (`admin@docflow.io`) is restricted.

---

### `GET /api/v1/admin/analytics`
Computes system-wide totals, upload trends, format distributions, and role metrics. Cached in Redis (`analytics:admin:overview`).

- **Authentication Required**: Yes (`ADMIN` Only)
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "total_users": 15,
    "total_documents": 142,
    "total_storage_bytes": 184500000,
    "active_users_count": 14,
    "daily_upload_trends": [ ... ],
    "file_type_distribution": [ ... ],
    "user_role_distribution": [
      { "role": "USER", "count": 13 },
      { "role": "ADMIN", "count": 2 }
    ]
  }
  ```

---

### `GET /api/v1/admin/activity-logs`
Queries paginated audit logs for security auditing.

- **Authentication Required**: Yes (`ADMIN` Only)
- **Query Parameters**: `skip` (default 0), `limit` (default 50)
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "items": [
      {
        "id": "log-001",
        "user_id": "1925bde9...",
        "action": "USER_LOGIN",
        "details": "Successful authentication for admin@docflow.io",
        "ip_address": "127.0.0.1",
        "created_at": "2026-08-03T18:00:00Z"
      }
    ],
    "total": 1
  }
  ```

---

## 🩺 5. System Health Diagnostic Endpoints

### `GET /health`
Verifies FastAPI status, PostgreSQL database connectivity, and Redis ping.

- **Authentication Required**: No
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "status": "ONLINE",
    "platform": "DocFlow - Secure Document Workflow Platform",
    "database": {
      "status": "CONNECTED",
      "engine": "SQLAlchemy 2.0 AsyncSession"
    },
    "redis": {
      "status": "CONNECTED",
      "mode": "STANDALONE_SERVER",
      "host": "redis",
      "port": 6379,
      "ttl_default_seconds": 300
    },
    "environment": {
      "debug": false,
      "api_prefix": "/api/v1"
    }
  }
  ```
