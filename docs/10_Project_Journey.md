# 10 — Project Journey & Evolution

An exhaustive chronological history documenting the implementation of DocFlow from Phase 0 through Phase 7.

---

## Phase 0 — Architecture & Planning

### Objectives
- Define simplified workspace directory layout (`frontend/`, `backend/`, `docs/`, `docker/`).
- Design Entity-Relationship (ER) diagram for `User`, `Document`, and `ActivityLog`.
- Formulate API endpoint contracts and design technical implementation plan.

### Implementation
- Drafted initial `implementation_plan.md` defining multi-phase technical roadmap.
- Established tech stack choices: Next.js 16 (App Router), FastAPI, PostgreSQL, Redis, Docker.

### Files Created
- `implementation_plan.md`
- `README.md` (Initial roadmap)

---

## Phase 1 — Frontend Foundation

### Objectives
- Initialize Next.js 16 application with TypeScript and Tailwind CSS.
- Build modern glassmorphism design system with dark mode aesthetics.
- Implement dashboard layouts, navigation sidebars, and Recharts visualization components.

### Implementation
- Created responsive dark-mode UI layout with curated HSL color palettes and modern typography (Inter).
- Built reusable Recharts visual components (`UploadTrendChart`, `FileTypeChart`, `StorageUsageChart`, `UserRoleChart`).

### Files Created
- `frontend/app/layout.tsx`
- `frontend/app/(dashboard)/layout.tsx`
- `frontend/components/layout/Sidebar.tsx`
- `frontend/components/layout/Header.tsx`
- `frontend/components/dashboard/*`

### Major Challenges & Solutions
- *Challenge*: Mismatched SSR/CSR layout rendering in Next.js 16.
- *Solution*: Leveraged client components with `useMounted()` guards for Recharts rendering.

---

## Phase 2 — Backend Foundation

### Objectives
- Set up FastAPI backend framework and Pydantic v2 BaseSettings configuration.
- Configure SQLAlchemy 2.0 AsyncSession with PostgreSQL and SQLite fallback engines.
- Initialize Alembic database migrations and generate initial schema.

### Implementation
- Configured `backend/app/core/config.py` using `pydantic-settings`.
- Defined SQLAlchemy ORM models (`User`, `Document`, `ActivityLog`).
- Generated initial Alembic migration `001_initial_models.py`.

### Files Created
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/core/database.py`
- `backend/app/models/*`
- `backend/alembic/*`

---

## Phase 3 — Authentication & Role-Based Access Control (RBAC)

### Objectives
- Implement Argon2id password hashing and PyJWT token generation.
- Attach HTTP-only `access_token` cookies for browser session persistence.
- Enforce default `USER` role on public registration and restrict `/admin` endpoints.

### Implementation
- Created `auth_service.py` handling password hashing, token issuance, and credential verification.
- Added `get_current_active_user` and `require_admin` dependency functions in `deps.py`.
- Hardened `POST /auth/register` to ignore client-supplied role values and enforce `USER` role.

### Files Created
- `backend/app/core/security.py`
- `backend/app/api/deps.py`
- `backend/app/api/v1/endpoints/auth.py`
- `backend/app/services/auth_service.py`
- `backend/test_phase3_auth.py`

### Major Challenges & Solutions
- *Challenge*: Security vulnerability allowing self-assigned admin roles during signup.
- *Solution*: Modified registration service to hardcode `role="USER"` for all public signups. Admin promotion made accessible only via CLI utilities or existing Admins.

---

## Phase 4 — Document Management & Local Storage

### Objectives
- Implement secure file uploads (.pdf, .docx, .txt) with server-side 10MB size limit.
- Store files on disk using UUID filename masking to prevent path traversal.
- Implement file streaming download (`GET /documents/{id}/download`) and deletion (`DELETE /documents/{id}`).

### Implementation
- Built `document_service.py` validating extensions, MIME types, and file sizes.
- Saved files to `backend/uploads/` with randomly generated UUIDs.
- Enforced strict ownership check (`document.owner_id == current_user.id`) returning HTTP 403 on unauthorized requests.

### Files Created
- `backend/app/api/v1/endpoints/documents.py`
- `backend/app/services/document_service.py`
- `backend/app/schemas/document.py`
- `backend/test_phase4_documents.py`

---

## Phase 5 — Redis Integration & Rate Limiting

### Objectives
- Integrate asynchronous Redis client (`redis.asyncio`) with FakeRedis fallback.
- Cache user document lists (`documents:user:{id}`) and user dashboard stats (`dashboard:user:{id}`).
- Implement atomic Redis sliding-window rate limiting on login and upload routes.

### Implementation
- Built `backend/app/core/redis.py` managing Redis connection lifecycle with graceful fallback.
- Created `RateLimiterDependency` utilizing Redis sorted sets (`ZSET`) to count requests in sliding windows.
- Created `cache_service.py` automating JSON serialization and cache invalidation upon uploads/deletes.

### Files Created
- `backend/app/core/redis.py`
- `backend/app/core/rate_limiter.py`
- `backend/app/services/cache_service.py`
- `backend/test_phase5_redis.py`

---

## Phase 6 — Admin Module & Full Live Integration

### Objectives
- Build administrative endpoints (`/admin/users`, `/admin/analytics`, `/admin/activity-logs`).
- Integrate frontend Zustand store (`useAuthStore`) and TanStack Query hooks with live FastAPI APIs.
- Remove 100% of mock data dependencies (`lib/mock-data.ts`).
- Enforce root admin & self-action UI/API guard rails for `admin@docflow.io`.

### Implementation
- Built `admin_service.py` and `analytics_service.py` calculating system totals, 7-day upload trends, format distributions, and role metrics.
- Connected Next.js pages (`/dashboard`, `/documents`, `/upload`, `/admin`, `/admin/users`, `/admin/health`) to live API responses.
- Implemented UI badges (`Primary System Admin`, `Current Active Session`) and backend API guards blocking self-demotion and modification of `admin@docflow.io`.

### Files Created
- `backend/app/api/v1/endpoints/admin.py`
- `backend/app/api/v1/endpoints/dashboard.py`
- `backend/app/services/admin_service.py`
- `backend/app/services/analytics_service.py`
- `frontend/store/useAuthStore.ts`
- `frontend/hooks/use-dashboard.ts`
- `frontend/lib/api-client.ts`
- `backend/test_phase6_admin.py`

---

## Phase 7 — Docker & Docker Compose Containerization

### Objectives
- Containerize FastAPI backend (`Python 3.11 slim`) and Next.js frontend (`Node 20 Alpine multi-stage`).
- Configure Docker Compose orchestrating `postgres`, `redis`, `backend`, and `frontend` on bridge network.
- Audit environment variable resolution and fix PostgreSQL volume initialization issues.

### Implementation
- Created `backend/Dockerfile`, `backend/entrypoint.sh`, `frontend/Dockerfile`, and root `docker-compose.yml`.
- Fixed `config.py` URL resolution logic to ensure container environment variables (`POSTGRES_SERVER=postgres`, `REDIS_HOST=redis`) dynamically construct container URLs instead of using `localhost`.
- Resolved PostgreSQL `"FATAL: role 'postgres' does not exist"` issue by documenting volume cleanup (`docker compose down -v`).

### Files Created / Updated
- `docker-compose.yml`
- `.env.example`
- `backend/Dockerfile`
- `backend/entrypoint.sh`
- `backend/.dockerignore`
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `backend/app/create_admin.py`
- `backend/seed_admin.py`
- `README.md`
