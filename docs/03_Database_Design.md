# 03 — Database Design

## 🗄 Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o{ documents : "owns (1:N)"
    users ||--o{ activity_logs : "generates (1:N)"

    users {
        string id PK "UUID"
        string email UK "Indexed, Unique, Case-insensitive"
        string hashed_password "Argon2id Hash"
        string full_name "Full Display Name"
        string role "USER or ADMIN (Default: USER)"
        boolean is_active "Active Status (Default: True)"
        datetime created_at "UTC Timestamp"
        datetime updated_at "UTC Timestamp"
    }

    documents {
        string id PK "UUID"
        string owner_id FK "ForeignKey -> users.id (Indexed)"
        string original_filename "Original Upload Name"
        string stored_filename "UUID On Disk (Indexed, Unique)"
        string file_path "Absolute Disk Path"
        integer file_size "Bytes"
        string mime_type "MIME Type"
        string file_extension "Extension (.pdf, .docx, .txt)"
        datetime created_at "UTC Timestamp (Indexed)"
        datetime updated_at "UTC Timestamp"
    }

    activity_logs {
        string id PK "UUID"
        string user_id FK "ForeignKey -> users.id (Indexed, Optional)"
        string action "Action Name (e.g. USER_LOGIN, DOCUMENT_UPLOADED)"
        string details "Audit Details Description"
        string ip_address "IPv4 or IPv6 Client Address"
        datetime created_at "UTC Timestamp (Indexed)"
        datetime updated_at "UTC Timestamp"
    }
```

---

## 📋 Detailed SQLAlchemy Model Specifications

### 1. `User` Model (`backend/app/models/user.py`)
Stores user accounts, credentials, role assignments, and active flags.

| Field Name | Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String(36)` | `Primary Key`, `Default: UUID4` | Unique surrogate primary key. |
| `email` | `String(255)` | `Unique`, `Indexed`, `Nullable=False` | Normalized lowercase email address used for authentication. |
| `hashed_password` | `String(255)` | `Nullable=False` | Argon2id password hash string. |
| `full_name` | `String(255)` | `Nullable=False` | Full user name. |
| `role` | `String(20)` | `Default: "USER"`, `Nullable=False` | Access role: `"USER"` or `"ADMIN"`. |
| `is_active` | `Boolean` | `Default: True`, `Nullable=False` | Account status flag (False = Disabled). |
| `created_at` | `DateTime(timezone=True)` | `Default: utcnow()` | Account creation timestamp. |
| `updated_at` | `DateTime(timezone=True)` | `Default: utcnow()`, `onupdate: utcnow()` | Record modification timestamp. |

#### Model Relationships & Cascade Rules
- **`documents`**: One-to-Many relationship to `Document` ORM objects (`cascade="all, delete-orphan"`).
- **`activity_logs`**: One-to-Many relationship to `ActivityLog` ORM objects (`cascade="all, delete-orphan"`).

---

### 2. `Document` Model (`backend/app/models/document.py`)
Stores metadata for files uploaded to local disk storage.

| Field Name | Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String(36)` | `Primary Key`, `Default: UUID4` | Unique document identifier. |
| `owner_id` | `String(36)` | `ForeignKey("users.id")`, `Indexed`, `Nullable=False` | Owner user ID foreign key. |
| `original_filename` | `String(255)` | `Nullable=False` | Original filename uploaded by client (e.g. `report.pdf`). |
| `stored_filename` | `String(255)` | `Unique`, `Indexed`, `Nullable=False` | Masked UUID filename on disk (`550e8400...pdf`). |
| `file_path` | `String(512)` | `Nullable=False` | Absolute disk path to stored file. |
| `file_size` | `Integer` | `Nullable=False` | File size in bytes. |
| `mime_type` | `String(100)` | `Nullable=False` | MIME type (e.g. `application/pdf`). |
| `file_extension` | `String(10)` | `Nullable=False` | File extension (e.g. `.pdf`, `.docx`, `.txt`). |
| `created_at` | `DateTime(timezone=True)` | `Indexed`, `Default: utcnow()` | Upload timestamp. |
| `updated_at` | `DateTime(timezone=True)` | `Default: utcnow()`, `onupdate: utcnow()` | Record modification timestamp. |

#### Model Relationships
- **`owner`**: Many-to-One relationship back to `User`.

---

### 3. `ActivityLog` Model (`backend/app/models/activity_log.py`)
Stores immutable system activity audit logs for security auditing.

| Field Name | Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String(36)` | `Primary Key`, `Default: UUID4` | Unique audit log ID. |
| `user_id` | `String(36)` | `ForeignKey("users.id")`, `Indexed`, `Nullable=True` | Optional foreign key of user performing the action. |
| `action` | `String(50)` | `Indexed`, `Nullable=False` | Action category code (`USER_LOGIN`, `DOCUMENT_UPLOADED`, `ROLE_UPDATED`, etc.). |
| `details` | `Text` | `Nullable=False` | Detailed human-readable log description. |
| `ip_address` | `String(45)` | `Nullable=True` | Client IP address string (IPv4/IPv6). |
| `created_at` | `DateTime(timezone=True)` | `Indexed`, `Default: utcnow()` | Action timestamp. |
| `updated_at` | `DateTime(timezone=True)` | `Default: utcnow()`, `onupdate: utcnow()` | Record modification timestamp. |

---

## ⚡ Database Indexes & Performance Optimization

To guarantee sub-second query latency under high load, explicit database indexes are placed on:

1. **`users.email`**: Unique index for instant $O(1)$ email lookups during login.
2. **`documents.owner_id`**: Foreign key index for querying user document lists.
3. **`documents.stored_filename`**: Unique index to prevent UUID collisions.
4. **`documents.created_at`**: Index for fast 7-day upload trend analytical queries.
5. **`activity_logs.created_at`**: Index for paginated audit log queries ordered by `created_at DESC`.

---

## 🔄 Alembic Migration Architecture & Evolution

Database migrations are managed via **Alembic**.

### Migration Configuration (`backend/alembic/env.py`)
Alembic imports `settings.get_sync_database_url()` to connect dynamically to PostgreSQL (`postgresql://postgres:postgres_password@postgres:5432/docflow_db`) or local SQLite fallback (`sqlite:///./docflow.db`).

### Schema Evolution Progression
- **Phase 2 Migration (`001_initial_models.py`)**: Created initial `users`, `documents`, and `activity_logs` tables with constraints and foreign keys.
- **Auto-Execution on Startup**: The backend container's `entrypoint.sh` executes:
  ```bash
  alembic upgrade head
  ```
  ensuring all database tables and indexes are automatically created before Uvicorn starts.
