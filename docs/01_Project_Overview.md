# 01 — Project Overview

## Executive Summary & Introduction

**DocFlow** is an enterprise-grade, secure Document Management & AI Workflow Platform engineered with modern full-stack web technologies. The platform provides end-to-end document lifecycle management — from secure user authentication and document ingestion to high-performance Redis caching, automated background audit logging, and administrative analytics dashboards.

DocFlow was designed to bridge the gap between enterprise security compliance (Role-Based Access Control, password hashing via Argon2id, HTTP-only JWT cookies) and responsive user experience (Next.js 16 App Router, TanStack Query v5 state synchronization, interactive Recharts data visualizations).

---

## Problem Statement & Business Objectives

### Problem Statement
Legacy document management systems suffer from key structural vulnerabilities:
1. **Unprotected File Storage & Direct URL Leaks**: Physical document files stored with original filenames exposed directly via web servers without authorization checks.
2. **Insecure Authentication**: Weak password hashing (MD5/SHA1), exposure of authentication tokens in LocalStorage (vulnerable to XSS attacks), or lacking Role-Based Access Control (RBAC).
3. **Database Performance Bottlenecks**: Heavy analytical queries (calculating storage consumption, file type breakdowns, and user activity) executing repeatedly on relational databases without caching layers.
4. **Lack of Audit Transparency**: Inability to track system activity (who uploaded, deleted, modified roles, or accessed administrative tools).

### Business Objectives
- **Zero-Trust Ownership Isolation**: Ensure every document belongs to exactly one authenticated user, with strict HTTP 403 Forbidden enforcement against unauthorized access.
- **Enterprise Security**: Implement Argon2id password hashing, HTTP-only `access_token` cookies, and strict RBAC (`USER` vs. `ADMIN` roles).
- **Sub-Millisecond Read Performance**: Integrate asynchronous Redis caching for document metadata and analytical dashboard queries.
- **Production Containerization**: Deliver a single-command deployment stack (`docker compose up --build`) encapsulating Frontend (Next.js), Backend (FastAPI), Relational Database (PostgreSQL 16), and Cache/Rate Limiter (Redis 7).

---

## Core System Features

### 1. Authentication & RBAC System
- **Argon2id Hashing**: High-memory, time-cost password hashing protecting against GPU/ASIC brute-force attacks.
- **HTTP-Only JWT Cookies**: Seamless, XSS-resistant session management via `access_token` cookies.
- **Role-Based Access Control (RBAC)**: Public registration defaults to `USER` role. Sensitive administrative routes (`/admin/*`) and API endpoints are strictly guarded by `ADMIN` authorization dependencies.
- **Self & Root Admin Protection**: Administrative UI & API guard rails prevent accidental self-demotion, self-disabling, or modification of the primary system administrator (`admin@docflow.io`).

### 2. Document Management & File Storage
- **Format Validation**: Strict whitelist for `.pdf`, `.docx`, and `.txt` files.
- **Size Enforcement**: Server-side 10MB maximum upload boundary.
- **UUID Filename Masking**: Files stored on disk with randomly generated UUIDs (`uploads/550e8400-e29b-41d4-a716-446655440000.pdf`) while preserving original filenames in database metadata to prevent directory traversal and file overwrites.
- **Secure File Streaming**: Downloads streamed through FastAPI `FileResponse` enforcing ownership verification.

### 3. Caching & Sliding-Window Rate Limiting
- **Redis Cache Layer**: Caches user document lists (`documents:user:{id}`), user dashboard metrics (`dashboard:user:{id}`), and admin analytics (`analytics:admin:overview`) with automated cache invalidation upon uploads/deletes.
- **Rate Limiting**: Custom Redis sliding-window algorithm protecting `/auth/login` (max 5 requests/min) and `/documents/upload` (max 10 requests/min).
- **FakeRedis Fallback**: Seamless local fallback to in-memory `fakeredis` if external Redis server is offline.

### 4. Analytics & Admin Console
- **User Dashboard**: Real-time metrics displaying storage usage, total documents, 7-day upload trends, and file format distribution.
- **Admin Management Console**: System-wide user list, role modification, account enable/disable, global storage overview, and full system activity audit logs.
- **System Health Diagnostics**: `/health` endpoint checking FastAPI server status, PostgreSQL database connection, and Redis cache ping response.

---

## Technology Stack & Architectural Justifications

| Layer | Technology | Architectural Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** | Server Components, fast client-side navigation, and optimized production bundle delivery. |
| **Language** | **TypeScript** | Type-safe data contracts across components, Zustand stores, and API responses. |
| **Styling** | **Tailwind CSS** | Utility-first CSS utility for glassmorphism, responsive grids, and modern dark mode aesthetic. |
| **State & Data Fetching** | **TanStack Query v5 + Zustand** | Query caching, automatic background refetching, mutation key invalidation, and global user session store. |
| **Data Visualizations** | **Recharts** | Smooth, animated Area, Bar, and Pie chart rendering for dashboard statistics. |
| **Backend Framework** | **FastAPI (Python 3.11)** | Asynchronous non-blocking concurrency, automatic OpenAPI documentation, and Pydantic v2 data validation. |
| **Database ORM** | **SQLAlchemy 2.0 (AsyncSession)** | Modern async SQL execution engine paired with `asyncpg` for PostgreSQL connection pooling. |
| **Migrations** | **Alembic** | Version-controlled database schema evolution and automated container migration startup (`alembic upgrade head`). |
| **Password Security** | **Argon2id (argon2-cffi)** | Winner of the Password Hashing Competition; immune to GPU cracking attacks unlike bcrypt/MD5. |
| **Primary Database** | **PostgreSQL 16** | ACID-compliant relational data store with dual-mode SQLite fallback (`docflow.db`) for instant local execution. |
| **Cache & Rate Limiter** | **Redis 7 (redis.asyncio)** | High-throughput in-memory key-value cache and atomic sliding-window rate limiting. |
| **Containerization** | **Docker & Docker Compose** | Multi-stage production container builds orchestrating 4 microservices on a bridge network. |

---

## Project Directory Structure

```text
Demo Project/
├── backend/
│   ├── alembic/                      # Alembic database migration scripts & env configuration
│   │   ├── versions/                 # Version migration files (e.g. 001_initial_schema.py)
│   │   └── env.py                    # Alembic runtime configuration
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py               # Dependency injection (DB session, current_user, require_admin)
│   │   │   └── v1/
│   │   │       ├── endpoints/        # Router controllers (auth, documents, dashboard, admin)
│   │   │       └── router.py         # Main API v1 router aggregator
│   │   ├── core/
│   │   │   ├── config.py             # BaseSettings pydantic configuration (.env reader)
│   │   │   ├── database.py           # SQLAlchemy AsyncEngine & AsyncSessionLocal setup
│   │   │   ├── rate_limiter.py       # Custom Redis sliding-window rate limiter dependency
│   │   │   ├── redis.py              # Async Redis client manager with FakeRedis fallback
│   │   │   └── security.py           # Argon2id password hashing & PyJWT token utilities
│   │   ├── models/                   # SQLAlchemy ORM Data Models (User, Document, ActivityLog)
│   │   ├── schemas/                  # Pydantic v2 validation schemas
│   │   ├── services/                 # Business logic service layer (user, document, analytics, admin)
│   │   ├── create_admin.py           # CLI script to seed or promote Admin accounts
│   │   └── main.py                   # FastAPI application factory, CORS, and /health endpoint
│   ├── Dockerfile                    # Python 3.11 slim production Dockerfile
│   ├── entrypoint.sh                 # Container startup script (runs migrations then uvicorn)
│   ├── requirements.txt              # Python dependency manifest
│   └── seed_admin.py                 # Host/Container admin account seeding utility
├── frontend/
│   ├── app/                          # Next.js 16 App Router structure
│   │   ├── (auth)/                   # Authentication pages (login, signup)
│   │   ├── (dashboard)/              # Authenticated layout & protected pages
│   │   │   ├── admin/                # Admin Panel pages (overview, users, health)
│   │   │   ├── dashboard/            # User Dashboard page
│   │   │   ├── documents/            # User Document Repository page
│   │   │   ├── upload/               # Document Upload page
│   │   │   └── layout.tsx            # Protected session layout with sidebar & header
│   │   └── layout.tsx                # Root layout & TanStack Query Provider
│   ├── components/                   # React UI Components (layout, forms, dashboard charts)
│   ├── hooks/                        # Custom TanStack Query React hooks
│   ├── lib/                          # API fetch client & utility helpers
│   ├── providers/                    # QueryClientProvider wrapper
│   ├── store/                        # Zustand global state stores (useAuthStore)
│   ├── types/                        # TypeScript domain interfaces & dashboard prop types
│   └── Dockerfile                    # Multi-stage Node 20 Alpine production Dockerfile
├── docs/                             # Complete System Documentation (01_Overview to 10_Journey)
├── docker-compose.yml                # Multi-container orchestration specification
├── .env.example                      # Root environment variables template
└── README.md                         # Repository landing page and quickstart guide
```

---

## High-Level End-to-End Workflow

```text
 ┌──────────────┐          HTTP Credentials         ┌────────────────────┐          JWT Issued           ┌────────────────────┐
 │  User Browser│ ─────────────────────────────────►│  FastAPI Backend   │ ────────────────────────────►│ HTTP-only Cookie   │
 └──────┬───────┘                                   └─────────┬──────────┘                               └─────────┬──────────┘
        │                                                     │                                                    │
        │ Upload Document (FormData)                          │ Store File                                         │
        ▼                                                     ▼                                                    │
 ┌──────────────┐           Insert Metadata         ┌────────────────────┐          Invalidate Cache     ┌─────────────▼──────┐
 │ Upload File  │ ─────────────────────────────────►│   PostgreSQL DB    │ ────────────────────────────►│  Redis Cache Engine│
 └──────────────┘                                   └────────────────────┘                               └────────────────────┘
```

1. **User Registers / Logs In**: Frontend submits credentials to `POST /api/v1/auth/login`. FastAPI verifies Argon2id hash, issues a signed PyJWT token, and attaches it as an HTTP-only `access_token` cookie.
2. **Session Guard Verification**: On every page load inside `(dashboard)`, Next.js calls `GET /api/v1/auth/me`. If unauthenticated, the user is redirected to `/login`. If a non-admin attempts to access `/admin/*`, they are redirected to `/dashboard`.
3. **Document Ingestion**: Authenticated user posts `file` to `POST /api/v1/documents/upload`. FastAPI validates extension/size, writes UUID file to `backend/uploads/`, inserts ORM record in PostgreSQL, and invalidates Redis keys (`documents:user:{id}`, `analytics:admin:overview`).
4. **Analytics Rendering**: Next.js fetches user statistics (`GET /api/v1/dashboard/user-stats`) or administrative stats (`GET /api/v1/admin/analytics`). FastAPI reads from Redis cache if warm, otherwise queries PostgreSQL and caches the result for 300 seconds.
