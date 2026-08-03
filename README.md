# DocFlow — Secure Document Workflow Platform

DocFlow is an enterprise-ready, production-grade Document Management & AI Workflow Platform built with Next.js 16 (App Router), FastAPI, PostgreSQL 16, Redis 7, and Docker.

---

## 🏗 Architecture & Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, TanStack Query v5, Recharts, Zustand.
- **Backend**: FastAPI, Async SQLAlchemy 2.0 (with AsyncPG), Pydantic v2, Alembic migrations.
- **Security**: Argon2id password hashing, PyJWT authentication, HTTP-only Cookies, Role-Based Access Control (`USER` / `ADMIN`).
- **Storage**: Local disk storage in `backend/uploads/` with UUID filename masking and MIME verification.
- **Caching & Rate Limiting**: Redis 7 async client with sliding-window rate limiting on `/login` and `/upload`.
- **Containerization**: Multi-container Docker Compose setup (`frontend`, `backend`, `postgres`, `redis`).

---

## 🚀 First-Time Clean Startup with Docker Compose

To guarantee a completely fresh database initialization and avoid conflicts with stale local volumes, run:

```bash
# 1. Clean up any existing or stale Docker containers and volumes
docker compose down -v

# 2. Build and launch all 4 containers
docker compose up --build
```

### Container Endpoints & Ports

- **Frontend Application**: `http://localhost:3000`
- **FastAPI API & Swagger UI**: `http://localhost:8000/docs`
- **Health Diagnostic Endpoint**: `http://localhost:8000/health`
- **PostgreSQL Database**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

---

## 🔑 Creating & Logging In as an Admin User

For security hardening, the public registration endpoint (`/signup`) **always defaults to the `USER` role** to prevent public visitors from granting themselves administrative privileges.

To create or promote an Admin account:

### Method 1: Using the Admin CLI Seed Script (Recommended)

Run the CLI utility script inside the running backend container:

```bash
# Create or promote default Admin account (admin@docflow.io / AdminPassword123!)
docker compose exec backend python app/create_admin.py

# Or specify custom credentials:
docker compose exec backend python app/create_admin.py myadmin@company.com MyPassword123! "System Admin"
```

### Default Admin Credentials Created:
A development admin account can be created using:

docker compose exec backend python app/create_admin.py

### Method 2: Promoting via Admin Console
Once logged in as an Admin (`admin@docflow.io`), navigate to **User Management Console** (`/admin/users`) to promote any user account by clicking **Toggle Role**.

---

## 🐳 Docker Command Cheat Sheet

### Manage Stack Execution

```bash
# Clean up containers and persistent data volumes
docker compose down -v

# Build and start all containers in foreground (view logs)
docker compose up --build

# Start all containers in background (detached mode)
docker compose up -d
```

### View Real-time Service Logs

```bash
# View aggregated logs for all services
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View frontend logs only
docker compose logs -f frontend
```

### Execute Commands Inside Containers

```bash
# Create or promote Admin user
docker compose exec backend python app/create_admin.py

# Check Alembic migration status inside backend container
docker compose exec backend alembic current

# Access PostgreSQL CLI
docker compose exec postgres psql -U postgres -d docflow_db

# Access Redis CLI
docker compose exec redis redis-cli ping
```

---

## 🔄 Automatic Database Migrations

When the backend container starts, `entrypoint.sh` automatically executes:

```bash
alembic upgrade head
```

This applies all pending database migrations before launching Uvicorn, ensuring zero manual database setup is required.

---

## 🛠 Troubleshooting: PostgreSQL "Role 'postgres' does not exist"

If Docker logs display `"PostgreSQL Database directory appears to contain a database; Skipping initialization"` followed by `"FATAL: role 'postgres' does not exist"`, the `postgres_data` Docker volume on your machine contains database files from a previous run initialized with different credentials.

To fix this root cause:
```bash
docker compose down -v
docker compose up --build
```
The `-v` flag removes the stale `postgres_data` volume so PostgreSQL runs `initdb` fresh and creates the `postgres` user role properly.
