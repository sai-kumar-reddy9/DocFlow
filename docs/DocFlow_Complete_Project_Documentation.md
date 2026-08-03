<div align="center">

# DocFlow — Secure Document Management & AI Workflow Platform
### Comprehensive Technical Specification & System Architecture Manual

<br />

**Project Version:** 1.0.0 (Production Release)  
**Technology Stack:** Next.js 16 (App Router) | FastAPI | PostgreSQL 16 | Redis 7 | Docker  
**Document Date:** August 2026  
**Classification:** Technical Software Engineering Report  

</div>

<div style="page-break-after: always; break-after: page;"></div>

---

# Table of Contents

- [Executive Summary](#executive-summary)
- [Chapter 1: Project Overview & Objectives](#chapter-1-project-overview--objectives)
  - [1.1 Introduction](#11-introduction)
  - [1.2 Problem Statement & Business Objectives](#12-problem-statement--business-objectives)
  - [1.3 Core System Features](#13-core-system-features)
  - [1.4 Technology Stack & Justifications](#14-technology-stack--justifications)
  - [1.5 Directory Structure](#15-directory-structure)
- [Chapter 2: System Architecture & Data Flow](#chapter-2-system-architecture--data-flow)
  - [2.1 Overall System Architecture](#21-overall-system-architecture)
  - [2.2 Frontend Architecture](#22-frontend-architecture)
  - [2.3 Backend Concurrency Architecture](#23-backend-concurrency-architecture)
  - [2.4 Sequence Diagrams](#24-sequence-diagrams)
  - [2.5 Redis Caching Architecture](#25-redis-caching-architecture)
  - [2.6 Docker Network Topology](#26-docker-network-topology)
- [Chapter 3: Database Schema & Migration Design](#chapter-3-database-schema--migration-design)
  - [3.1 Entity-Relationship (ER) Diagram](#31-entity-relationship-er-diagram)
  - [3.2 Detailed SQLAlchemy Model Specifications](#32-detailed-sqlalchemy-model-specifications)
  - [3.3 Database Indexes & Optimization](#33-database-indexes--optimization)
  - [3.4 Alembic Migration Evolution](#34-alembic-migration-evolution)
- [Chapter 4: Comprehensive REST API Specification](#chapter-4-comprehensive-rest-api-specification)
  - [4.1 Authentication & RBAC Endpoints](#41-authentication--rbac-endpoints)
  - [4.2 Document Management Endpoints](#42-document-management-endpoints)
  - [4.3 Dashboard Analytics Endpoints](#43-dashboard-analytics-endpoints)
  - [4.4 Admin Module Endpoints](#44-admin-module-endpoints)
  - [4.5 System Health Diagnostics](#45-system-health-diagnostics)
- [Chapter 5: Backend Concurrency & Service Layer Architecture](#chapter-5-backend-concurrency--service-layer-architecture)
  - [5.1 FastAPI Application Core](#51-fastapi-application-core)
  - [5.2 Dependency Injection System](#52-dependency-injection-system)
  - [5.3 Custom Redis Sliding-Window Rate Limiter](#53-custom-redis-sliding-window-rate-limiter)
  - [5.4 Caching Service Implementation](#54-caching-service-implementation)
  - [5.5 Audit Logging & Error Handling](#55-audit-logging--error-handling)
- [Chapter 6: Frontend App Router & Client State Architecture](#chapter-6-frontend-app-router--client-state-architecture)
  - [6.1 Next.js 16 App Router Layout](#61-nextjs-16-app-router-layout)
  - [6.2 Protected Session Layout Guard](#62-protected-session-layout-guard)
  - [6.3 Zustand Global Auth Store](#63-zustand-global-auth-store)
  - [6.4 TanStack Query v5 Data Fetching Hooks](#64-tanstack-query-v5-data-fetching-hooks)
  - [6.5 Recharts Visualizations & Admin Console](#65-recharts-visualizations--admin-console)
- [Chapter 7: Enterprise Security & Threat Defense Architecture](#chapter-7-enterprise-security--threat-defense-architecture)
  - [7.1 Argon2id Password Security](#71-argon2id-password-security)
  - [7.2 HTTP-Only Cookie Session Persistence](#72-http-only-cookie-session-persistence)
  - [7.3 Role-Based Access Control & Admin Guard Rails](#73-role-based-access-control--admin-guard-rails)
  - [7.4 Secure File Storage & Path Traversal Prevention](#74-secure-file-storage--path-traversal-prevention)
  - [7.5 Ownership Authorization & Rate Limiting](#75-ownership-authorization--rate-limiting)
- [Chapter 8: Docker Containerization & Deployment Orchestration](#chapter-8-docker-containerization--deployment-orchestration)
  - [8.1 Dockerfile Specifications](#81-dockerfile-specifications)
  - [8.2 Docker Compose Orchestration](#82-docker-compose-orchestration)
  - [8.3 Deployment & Management Commands](#83-deployment--management-commands)
  - [8.4 Troubleshooting Guide](#84-troubleshooting-guide)
- [Chapter 9: Quality Assurance, Automated Test Suites & Verification](#chapter-9-quality-assurance-automated-test-suites--verification)
  - [9.1 Automated Python Test Suites](#91-automated-python-test-suites)
  - [9.2 TypeScript Verification & Health Diagnostics](#92-typescript-verification--health-diagnostics)
  - [9.3 Future Enhancements](#93-future-enhancements)
- [Chapter 10: Chronological Project Development Journey](#chapter-10-chronological-project-development-journey)
  - [10.1 Phase 0 through Phase 7 History](#101-phase-0-through-phase-7-history)

<div style="page-break-after: always; break-after: page;"></div>

---

# Executive Summary

**DocFlow** is an enterprise-grade, secure Document Management & AI Workflow Platform engineered with modern full-stack web technologies. The platform provides end-to-end document lifecycle management — from secure user authentication and document ingestion to high-performance Redis caching, automated background audit logging, and administrative analytics dashboards.

DocFlow bridges enterprise security compliance (Role-Based Access Control, password hashing via Argon2id, HTTP-only JWT cookies) with responsive user experiences (Next.js 16 App Router, TanStack Query v5 state synchronization, interactive Recharts data visualizations).

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 1: Project Overview & Objectives

## 1.1 Introduction
In modern enterprise environments, managing document workflows securely while maintaining high operational throughput is a critical requirement. DocFlow provides a centralized platform allowing users to store, manage, and analyze documents while providing system administrators with real-time audit visibility and access controls.

## 1.2 Problem Statement & Business Objectives

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
- **Production Containerization**: Deliver a single-command deployment stack (`docker compose up -d --build`) encapsulating Frontend (Next.js), Backend (FastAPI), Relational Database (PostgreSQL 16), and Cache/Rate Limiter (Redis 7).

## 1.3 Core System Features

### 🔐 1. Authentication & RBAC System
- **Argon2id Hashing**: High-memory, time-cost password hashing protecting against GPU/ASIC brute-force attacks.
- **HTTP-Only JWT Cookies**: Seamless, XSS-resistant session management via `access_token` cookies.
- **Role-Based Access Control (RBAC)**: Public registration defaults to `USER` role. Sensitive administrative routes (`/admin/*`) and API endpoints are strictly guarded by `ADMIN` authorization dependencies.
- **Self & Root Admin Protection**: Administrative UI & API guard rails prevent accidental self-demotion, self-disabling, or modification of the primary system administrator (`admin@docflow.io`).

### 📄 2. Document Management & File Storage
- **Format Validation**: Strict whitelist for `.pdf`, `.docx`, and `.txt` files.
- **Size Enforcement**: Server-side 10MB maximum upload boundary.
- **UUID Filename Masking**: Files stored on disk with randomly generated UUIDs (`uploads/550e8400-e29b-41d4-a716-446655440000.pdf`) while preserving original filenames in database metadata to prevent directory traversal and file overwrites.
- **Secure File Streaming**: Downloads streamed through FastAPI `FileResponse` enforcing ownership verification.

### ⚡ 3. Caching & Sliding-Window Rate Limiting
- **Redis Cache Layer**: Caches user document lists (`documents:user:{id}`), user dashboard metrics (`dashboard:user:{id}`), and admin analytics (`analytics:admin:overview`) with automated cache invalidation upon uploads/deletes.
- **Rate Limiting**: Custom Redis sliding-window algorithm protecting `/auth/login` (max 5 requests/min) and `/documents/upload` (max 10 requests/min).
- **FakeRedis Fallback**: Seamless local fallback to in-memory `fakeredis` if external Redis server is offline.

### 📊 4. Analytics & Admin Console
- **User Dashboard**: Real-time metrics displaying storage usage, total documents, 7-day upload trends, and file format distribution.
- **Admin Management Console**: System-wide user list, role modification, account enable/disable, global storage overview, and full system activity audit logs.
- **System Health Diagnostics**: `/health` endpoint checking FastAPI server status, PostgreSQL database connection, and Redis cache ping response.

## 1.4 Technology Stack & Justifications

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

## 1.5 Directory Structure

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
├── docs/                             # Complete System Documentation
├── docker-compose.yml                # Multi-container orchestration specification
├── .env.example                      # Root environment variables template
└── README.md                         # Repository landing page and quickstart guide
```

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 2: System Architecture & Data Flow

## 2.1 Overall System Architecture

```text
+-----------------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER LAYER                                       |
|                                                                                               |
|   +--------------------------+   +------------------------+   +---------------------------+   |
|   |  Next.js 16 Web App      |   |  Zustand Auth Store    |   |   TanStack Query v5 Cache |   |
|   |  (Port 3000)             |   |  (useAuthStore)        |   |   (Server State Management)|  |
|   +--------------------------+   +------------------------+   +---------------------------+   |
|                                                |                                              |
+------------------------------------------------|----------------------------------------------+
                                                 | HTTP Requests & Cookies
                                                 v
+-----------------------------------------------------------------------------------------------+
|                          DOCKER COMPOSE BRIDGE NETWORK (docflow-network)                      |
|                                                                                               |
|   +---------------------------------------------------------------------------------------+   |
|   |                         FASTAPI BACKEND CONTAINER (Port 8000)                         |   |
|   |                                                                                       |   |
|   |  [API v1 Router] ---> [Auth & Admin Deps] ---> [Service Layer] ---> [Async Session]   |   |
|   +---------------------------------------------------------------------------|-----------+   |
|                                                                               |               |
|            +------------------------------------------------------------------+               |
|            |                                                                  |               |
|            v                                                                  v               |
|   +---------------------------------------+                  +----------------------------+   |
|   |        POSTGRESQL 16 DATABASE         |                  |   REDIS 7 CACHE & LIMITER  |   |
|   |     (Port 5432 / postgres_data)       |                  |  (Port 6379 / redis_data)   |   |
|   +---------------------------------------+                  +----------------------------+   |
+-----------------------------------------------------------------------------------------------+
```

## 2.2 Frontend Architecture

The frontend application is structured using Next.js 16 App Router, TypeScript, Tailwind CSS, TanStack Query v5, and Zustand.

### Key Architectural Layers
1. **Route Groups & Protection**:
   - `app/(auth)`: Public authentication routes (`/login`, `/signup`).
   - `app/(dashboard)`: Authenticated layout wrapped with session verification. Executes `checkAuth()` on mount.
   - `app/(dashboard)/admin/*`: Role-restricted pages guarded by `user.role === 'ADMIN'` check.
2. **Global State Management (Zustand)**:
   - `useAuthStore`: Manages user profile (`UserResponse | null`), authentication status, loading states, and auth actions (`login`, `signup`, `logout`, `checkAuth`).
3. **Data Fetching & Cache Invalidation (TanStack Query v5)**:
   - Custom React hooks in `hooks/use-dashboard.ts` manage server queries (`useUserDocuments`, `useUserDashboardStats`, `useAdminAnalytics`, `useAdminUsers`, `useActivityLogs`) and mutations (`useDeleteDocument`, `useToggleUserStatus`, `useUpdateUserRole`).
   - Invalidates query keys (`["user-documents"]`, `["admin-analytics"]`, `["admin-users"]`) automatically upon successful mutations.
4. **API Client (`lib/api-client.ts`)**:
   - Centralized wrapper over native `fetch` API configured with `credentials: "include"`, ensuring HTTP-only `access_token` cookies are transmitted automatically on cross-origin calls.

## 2.3 Backend Concurrency Architecture

The backend service is built with FastAPI, using asynchronous non-blocking I/O and Pydantic v2 schemas.

```text
 ┌────────────────┐      Request       ┌────────────────┐      Validate      ┌────────────────┐
 │ Client Request │ ─────────────────► │ FastAPI Router │ ─────────────────► │ Pydantic Schema│
 └────────────────┘                    └───────┬────────┘                    └───────┬────────┘
                                               │                                     │
                                               │ Inject Dependencies                 │ Validated Input
                                               ▼                                     ▼
 ┌────────────────┐      Execute       ┌────────────────┐     ORM Query      ┌────────────────┐
 │ PostgreSQL DB  │ ◄───────────────── │ Service Layer  │ ◄───────────────── │ Dependency (DB)│
 └────────────────┘                    └────────────────┘                    └────────────────┘
```

## 2.4 Sequence Diagrams

### Authentication Sequence
```text
[User Browser]           [Next.js App]           [FastAPI Backend]          [PostgreSQL DB]          [HTTP Cookie Store]
      |                        |                         |                         |                         |
      |-- 1. Submit Login ---->|                         |                         |                         |
      |                        |-- 2. POST /auth/login ->|                         |                         |
      |                        |                         |-- 3. Query Email ------>|                         |
      |                        |                         |<-- 4. User Record ------|                         |
      |                        |                         |                         |                         |
      |                        |                         |-- 5. Verify Argon2id --|                         |
      |                        |                         |                         |                         |
      |                        |                         |-- 6. Issue PyJWT Token -|                         |
      |                        |                         |                         |                         |
      |                        |                         |-- 7. Set Cookie --------------------------------->|
      |                        |<-- 8. 200 OK + JWT -----|                         |                         |
      |                        |                         |                         |                         |
      |<-- 9. Redirect --------|                         |                         |                         |
```

### Document Upload Sequence
```text
[User Browser]           [Next.js App]          [Redis Limiter]          [FastAPI Backend]          [Disk Storage]          [PostgreSQL DB]
      |                        |                       |                         |                        |                       |
      |-- 1. Select & Upload ->|                       |                         |                        |                       |
      |                        |-- 2. POST /upload --->|                         |                        |                       |
      |                        |                       |-- 3. Check Rate Limit ->|                        |                       |
      |                        |                       |<-- 4. Allowed ----------|                        |                       |
      |                        |                       |                         |                        |                       |
      |                        |                         |-- 5. Validate File ----|                        |                       |
      |                        |                         |-- 6. Save UUID File --------------------------->|                       |
      |                        |                         |-- 7. Insert Metadata ------------------------------------------------->|
      |                        |                         |                         |                        |                       |
      |                        |                         |-- 8. Purge Redis Cache -|                        |                       |
      |                        |<-- 9. 201 Created ------|                         |                        |                       |
      |<-- 10. Show Success ---|                       |                         |                        |                       |
```

## 2.5 Redis Caching Architecture

```text
                               ┌────────────────────────┐
                               │  GET Document / Stats  │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │ Check Redis Cache Key  │
                               └───────────┬────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
                 Cache Hit (JSON)                      Cache Miss / Error
                        │                                     │
                        ▼                                     ▼
             ┌─────────────────────┐               ┌─────────────────────┐
             │ Return Cached JSON  │               │ Query PostgreSQL DB │
             └─────────────────────┘               └──────────┬──────────┘
                                                              │
                                                              ▼
                                                   ┌─────────────────────┐
                                                   │ Write Result to     │
                                                   │ Redis (TTL 300s)    │
                                                   └──────────┬──────────┘
                                                              │
                                                              ▼
                                                   ┌─────────────────────┐
                                                   │ Return Fresh Data   │
                                                   └─────────────────────┘
```

## 2.6 Docker Network Topology

```text
 ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   Docker Bridge: docflow-network                                  │
 │                                                                                                   │
 │   ┌───────────────────────┐                  HTTP                  ┌──────────────────────────┐   │
 │   │   docflow-frontend    │ ──────────────────────────────────────►│     docflow-backend      │   │
 │   │   (Node 20 Alpine)    │                                        │     (Python 3.11 Slim)   │   │
 │   │   Port: 3000          │                                        │     Port: 8000           │   │
 │   └───────────────────────┘                                        └────────────┬─────────────┘   │
 │                                                                                 │                 │
 │                                             ┌───────────────────────────────────┴─────────────┐   │
 │                                             │                                                 │   │
 │                                             ▼                                                 ▼   │
 │                                ┌──────────────────────────┐                      ┌──────────────────────────┐
 │                                │     docflow-postgres     │                      │      docflow-redis       │
 │                                │    (PostgreSQL 16)       │                      │       (Redis 7)          │
 │                                │    Port: 5432            │                      │       Port: 6379         │
 │                                └────────────┬─────────────┘                      └────────────┬─────────────┘
 │                                             │                                                 │
 └─────────────────────────────────────────────┼─────────────────────────────────────────────────┼───┘
                                               ▼                                                 ▼
                                    ┌────────────────────┐                            ┌────────────────────┐
                                    │  postgres_data     │                            │   redis_data       │
                                    │  (Docker Volume)   │                            │  (Docker Volume)   │
                                    └────────────────────┘                            └────────────────────┘
```

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 3: Database Schema & Migration Design

## 3.1 Entity-Relationship (ER) Diagram

```text
 +-----------------------------------+              +-----------------------------------+
 |               USERS               |              |             DOCUMENTS             |
 +-----------------------------------+              +-----------------------------------+
 | PK  id                String(36)  |<---+         | PK  id                String(36)  |
 | UK  email             String(255) |    |         | FK  owner_id          String(36)  |-----+
 |     hashed_password   String(255) |    +--------O|     original_filename String(255) |     |
 |     full_name         String(255) |              | UK  stored_filename   String(255) |     |
 |     role              String(20)  |              |     file_path         String(512) |     |
 |     is_active         Boolean     |              |     file_size         Integer     |     |
 |     created_at        DateTime    |              |     mime_type         String(100) |     |
 |     updated_at        DateTime    |              |     file_extension    String(10)  |     |
 +-----------------------------------+              |     created_at        DateTime    |     |
                   |                                |     updated_at        DateTime    |     |
                   |                                +-----------------------------------+     |
                   |                                                                          |
                   |                                +-----------------------------------+     |
                   |                                |           ACTIVITY_LOGS           |     |
                   |                                +-----------------------------------+     |
                   |                                | PK  id                String(36)  |     |
                   +-------------------------------O| FK  user_id           String(36)  |<----+
                                                    |     action            String(50)  |
                                                    |     details           Text        |
                                                    |     ip_address        String(45)  |
                                                    |     created_at        DateTime    |
                                                    |     updated_at        DateTime    |
                                                    +-----------------------------------+
```

## 3.2 Detailed SQLAlchemy Model Specifications

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

## 3.3 Database Indexes & Optimization

1. **`users.email`**: Unique index for instant O(1) email lookups during login.
2. **`documents.owner_id`**: Foreign key index for querying user document lists.
3. **`documents.stored_filename`**: Unique index to prevent UUID collisions.
4. **`documents.created_at`**: Index for fast 7-day upload trend analytical queries.
5. **`activity_logs.created_at`**: Index for paginated audit log queries ordered by `created_at DESC`.

## 3.4 Alembic Migration Evolution

Database migrations are managed via **Alembic**.

### Migration Configuration (`backend/alembic/env.py`)
Alembic imports `settings.get_sync_database_url()` to connect dynamically to PostgreSQL (`postgresql://postgres:postgres_password@postgres:5432/docflow_db`) or local SQLite fallback (`sqlite:///./docflow.db`).

### Schema Evolution Progression
- **Phase 2 Migration (`001_initial_models.py`)**: Created initial `users`, `documents`, and `activity_logs` tables with constraints and foreign keys.
- **Auto-Execution on Startup**: The backend container's `entrypoint.sh` executes:
  ```bash
  alembic upgrade head
  ```

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 4: Comprehensive REST API Specification

Base API URL: `http://localhost:8000/api/v1`

## 4.1 Authentication & RBAC Endpoints

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

### `POST /api/v1/auth/logout`
Clears the HTTP-only `access_token` cookie.

- **Authentication Required**: No
- **Response** (`HTTP 200 OK`):
  ```json
  {
    "message": "Successfully logged out."
  }
  ```

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

## 4.2 Document Management Endpoints

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

### `GET /api/v1/documents/{document_id}`
Gets metadata for a single document. Enforces ownership access control.

- **Authentication Required**: Yes
- **Response** (`HTTP 200 OK`): Document metadata object.
- **Errors**:
  - `HTTP 404 Not Found`: Document ID does not exist.
  - `HTTP 403 Forbidden`: Document belongs to another user.

### `GET /api/v1/documents/{document_id}/download`
Streams physical document file content for download. Enforces ownership authorization.

- **Authentication Required**: Yes
- **Response** (`HTTP 200 OK`): File binary stream with `Content-Disposition: attachment`.
- **Errors**: `HTTP 403 Forbidden` if requested by non-owner.

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

## 4.3 Dashboard Analytics Endpoints

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

## 4.4 Admin Module Endpoints

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

## 4.5 System Health Diagnostics

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

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 5: Backend Concurrency & Service Layer Architecture

## 5.1 FastAPI Application Core

The DocFlow backend is built on **FastAPI** using asynchronous Python 3.11 features (`async`/`await`), **SQLAlchemy 2.0 AsyncSession**, and **Pydantic v2** data schemas.

```text
                               ┌────────────────────────────────┐
                               │     FastAPI Application        │
                               │        (app/main.py)           │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │      API Router Aggregator     │
                               │     (app/api/v1/router.py)     │
                               └───────────────┬────────────────┘
                                               │
               ┌───────────────────────┬───────┴───────────────┬───────────────────────┐
               ▼                       ▼                       ▼                       ▼
      ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
      │  auth.py Router │     │documents.py Rtr │     │dashboard.py Rtr │     │ admin.py Router │
      └────────┬────────┘     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
               │                       │                       │                       │
               └───────────────────────┼───────────────────────┴───────────────────────┘
                                       │
                                       ▼ Dependency Injection (app/api/deps.py)
                         ┌───────────────────────────┐
                         │  - get_db                 │
                         │  - get_current_active_user│
                         │  - require_admin          │
                         │  - RateLimiterDependency  │
                         └─────────────┬─────────────┘
                                       │
                                       ▼ Business Logic Services (app/services/)
                         ┌───────────────────────────┐
                         │  - auth_service           │
                         │  - document_service       │
                         │  - analytics_service      │
                         │  - admin_service          │
                         │  - cache_service          │
                         │  - activity_log_service   │
                         └───────────────────────────┘
```

## 5.2 Dependency Injection System (`app/api/deps.py`)

### 1. Database Dependency (`get_db`)
```python
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### 2. User Authentication Dependency (`get_current_active_user`)
1. Reads `access_token` from HTTP-only cookie or `Authorization: Bearer <token>` header.
2. Decodes JWT using `SECRET_KEY` and algorithm `HS256`.
3. Verifies token expiration (`exp`) and extracts `sub` (User ID).
4. Queries PostgreSQL database for `User` ORM record.
5. Verifies `user.is_active is True`. Raises `HTTP 401 Unauthorized` if invalid or disabled.

### 3. Role Authorization Dependency (`require_admin`)
```python
async def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin access required."
        )
    return current_user
```

## 5.3 Custom Redis Sliding-Window Rate Limiter (`app/core/rate_limiter.py`)

```python
class RateLimiterDependency:
    def __init__(self, prefix: str, max_requests: int, window_seconds: int):
        self.prefix = prefix
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{self.prefix}:{client_ip}"
        now = time.time()
        clear_before = now - self.window_seconds

        redis_client = await get_redis()
        if redis_client:
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, clear_before)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, self.window_seconds)
            results = await pipe.execute()
            request_count = results[2]

            if request_count > self.max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {self.max_requests} requests per {self.window_seconds}s."
                )
```

## 5.4 Caching Service Implementation (`app/services/cache_service.py`)

### Cache Key Structure
- **User Document List**: `documents:user:{user_id}` (TTL: 300s)
- **User Dashboard Stats**: `dashboard:user:{user_id}` (TTL: 300s)
- **Admin System Analytics**: `analytics:admin:overview` (TTL: 300s)

### Cache Invalidation Rules
Whenever a state-modifying action occurs:
- **On File Upload (`POST /documents/upload`)**: Invalidates `documents:user:{user_id}`, `dashboard:user:{user_id}`, and `analytics:admin:overview`.
- **On File Delete (`DELETE /documents/{id}`)**: Invalidates `documents:user:{user_id}`, `dashboard:user:{user_id}`, and `analytics:admin:overview`.
- **On Status/Role Update (`PATCH /admin/users/{id}/*`)**: Invalidates `analytics:admin:overview`.

## 5.5 Audit Logging & Error Handling

| Exception Type | HTTP Code | Cause / Trigger | Response Body |
| :--- | :--- | :--- | :--- |
| **`HTTPException`** | `400 Bad Request` | Invalid file format, size > 10MB, or modifying protected admin. | `{"detail": "File size exceeds 10MB limit."}` |
| **`HTTPException`** | `401 Unauthorized` | Invalid password, expired JWT, or missing cookie. | `{"detail": "Invalid email or password."}` |
| **`HTTPException`** | `403 Forbidden` | Accessing document owned by another user or non-admin hitting `/admin/*`. | `{"detail": "Access forbidden: You do not have permission."}` |
| **`HTTPException`** | `404 Not Found` | Document ID or User ID does not exist in DB. | `{"detail": "Document not found."}` |
| **`HTTPException`** | `429 Too Many Requests` | Redis rate limit boundary breached. | `{"detail": "Rate limit exceeded."}` |

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 6: Frontend App Router & Client State Architecture

## 6.1 Next.js 16 App Router Layout

```text
frontend/app/
├── (auth)/
│   ├── login/page.tsx               # Public Login Form Page
│   └── signup/page.tsx              # Public Registration Form Page
├── (dashboard)/
│   ├── layout.tsx                   # Authenticated Session Guard Layout (Sidebar + Header)
│   ├── dashboard/page.tsx           # User Dashboard Analytics & Visualizations
│   ├── documents/page.tsx           # User Document Repository & File Streaming
│   ├── upload/page.tsx              # Live Document Upload Form Page
│   └── admin/                       # Administrative Management Console
│       ├── page.tsx                 # System Analytics Overview Page
│       ├── users/page.tsx           # User Management Table & Role Toggle Console
│       └── health/page.tsx          # System Health Diagnostics & Audit Logs Page
├── layout.tsx                       # Root App Layout & TanStack Query Client Provider
└── page.tsx                         # Landing Page / Redirect Router
```

## 6.2 Protected Session Layout Guard (`app/(dashboard)/layout.tsx`)

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, pathname]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

## 6.3 Zustand Global Auth Store (`frontend/store/useAuthStore.ts`)

```typescript
interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  signup: (userData: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
```

## 6.4 TanStack Query v5 Data Fetching Hooks (`frontend/hooks/use-dashboard.ts`)

| Custom Hook Name | API Endpoint | Query / Mutation Type | Invalidation Target |
| :--- | :--- | :--- | :--- |
| `useUserDocuments()` | `GET /api/v1/documents` | Query (`["user-documents"]`) | N/A |
| `useUserDashboardStats()` | `GET /api/v1/dashboard/user-stats` | Query (`["user-dashboard-stats"]`) | N/A |
| `useDeleteDocument()` | `DELETE /api/v1/documents/{id}` | Mutation | Invalidates `["user-documents"]`, `["user-dashboard-stats"]`, `["admin-analytics"]` |
| `useAdminAnalytics()` | `GET /api/v1/admin/analytics` | Query (`["admin-analytics"]`) | N/A |
| `useAdminUsers()` | `GET /api/v1/admin/users` | Query (`["admin-users"]`) | N/A |
| `useToggleUserStatus()` | `PATCH /api/v1/admin/users/{id}/status` | Mutation | Invalidates `["admin-users"]`, `["admin-analytics"]` |
| `useUpdateUserRole()` | `PATCH /api/v1/admin/users/{id}/role` | Mutation | Invalidates `["admin-users"]`, `["admin-analytics"]` |
| `useActivityLogs()` | `GET /api/v1/admin/activity-logs` | Query (`["activity-logs"]`) | N/A |
| `useHealth()` | `GET /health` | Query (`["health-status"]`) | N/A |

## 6.5 Recharts Visualizations & Admin Console

```typescript
users.map((u: any) => {
  const isPrimaryAdmin = u.email.toLowerCase() === "admin@docflow.io";
  const isSelf = u.id === currentUser?.id || u.email.toLowerCase() === currentUser?.email?.toLowerCase();

  return (
    <tr key={u.id}>
      <td className="p-4">
        {isPrimaryAdmin ? (
          <span className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 text-[11px] font-medium">
            Primary System Admin
          </span>
        ) : isSelf ? (
          <span className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-[11px] font-medium">
            Current Active Session
          </span>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => handleToggleRole(u.id, u.role)}>Toggle Role</button>
            <button onClick={() => handleToggleStatus(u.id, u.status)}>Disable</button>
          </div>
        )}
      </td>
    </tr>
  );
})
```

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 7: Enterprise Security & Threat Defense Architecture

## 7.1 Argon2id Password Security

Passwords are formatted using **Argon2id** (`argon2-cffi`):

```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher(
    time_cost=3,        # 3 iterations
    memory_cost=65536,  # 64 MB RAM per hash
    parallelism=4,      # 4 parallel threads
    hash_len=32,
    salt_len=16
)

def get_password_hash(password: str) -> str:
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False
```

## 7.2 HTTP-Only Cookie Session Persistence

```python
response.set_cookie(
    key=settings.COOKIE_NAME,    # "access_token"
    value=access_token,
    httponly=True,               # Prevents JavaScript document.cookie access (XSS immune)
    max_age=1440 * 60,           # 24 hours
    samesite="lax",              # Protects against Cross-Site Request Forgery (CSRF)
    secure=False,                # Set to True in HTTPS production environments
)
```

## 7.3 Role-Based Access Control & Admin Guard Rails

1. **Public Registration Hardening**: Defaults all public signups to `USER` role.
2. **Root Admin Guard**: `admin@docflow.io` cannot be disabled or demoted via UI or API endpoints.
3. **Self-Action Prevention**: Authenticated admins cannot demote or disable their own active account.

## 7.4 Secure File Storage & Path Traversal Prevention

Files are written to disk using UUID4 masking:

```python
file_ext = os.path.splitext(file.filename)[1].lower()
uuid_filename = f"{uuid.uuid4()}{file_ext}"
file_path = os.path.join(settings.UPLOAD_DIR, uuid_filename)
```
Discards client-supplied path strings, completely eliminating directory traversal attacks.

## 7.5 Ownership Authorization & Rate Limiting

- **Ownership Assertion**: Enforces `document.owner_id == current_user.id` on read, download, and delete.
- **Redis Rate Limits**: Login (5 requests/min) and Upload (10 requests/min).

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 8: Docker Containerization & Deployment Orchestration

## 8.1 Dockerfile Specifications

### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/uploads && chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
```

### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

## 8.2 Docker Compose Orchestration (`docker-compose.yml`)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: docflow-postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres_password}
      POSTGRES_DB: ${POSTGRES_DB:-docflow_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-docflow_db}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - docflow-network

  redis:
    image: redis:7-alpine
    container_name: docflow-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - docflow-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: docflow-backend
    restart: always
    environment:
      - DEBUG=False
      - POSTGRES_SERVER=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres_password}
      - POSTGRES_DB=${POSTGRES_DB:-docflow_db}
      - DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres_password}@postgres:5432/${POSTGRES_DB:-docflow_db}
      - SYNC_DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres_password}@postgres:5432/${POSTGRES_DB:-docflow_db}
      - USE_SQLITE_FALLBACK=False
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY:-docflow_super_secret_production_key_32_bytes_long}
      - ACCESS_TOKEN_EXPIRE_MINUTES=1440
      - UPLOAD_DIR=/app/uploads
    ports:
      - "8000:8000"
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - docflow-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    container_name: docflow-frontend
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - docflow-network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  uploads_data:
    driver: local

networks:
  docflow-network:
    driver: bridge
```

## 8.3 Deployment & Management Commands

```bash
# Start container stack in detached mode
docker compose up -d --build

# Stop containers and remove persistent volumes
docker compose down -v

# Rebuild containers after code edits
docker compose up -d --build --force-recreate

# Seed Admin Account inside container
docker compose exec backend python seed_admin.py admin@docflow.io AdminPassword123!
```

## 8.4 Troubleshooting Guide

### Issue: PostgreSQL "FATAL: role 'postgres' does not exist"
- **Root Cause**: Host volume `postgres_data` contains files initialized from an earlier interrupted run.
- **Fix**: Remove the stale volume and restart:
  ```bash
  docker compose down -v
  docker compose up -d --build
  ```

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 9: Quality Assurance, Automated Test Suites & Verification

## 9.1 Automated Python Test Suites

### 1. Phase 3 Authentication Test (`backend/test_phase3_auth.py`)
```bash
cd backend
python test_phase3_auth.py
```
- Verifies Argon2id password hashing, PyJWT token generation, HTTP-only cookie attachment, user profile retrieval, and RBAC boundary enforcement.

### 2. Phase 4 Document Management Test (`backend/test_phase4_documents.py`)
```bash
cd backend
python test_phase4_documents.py
```
- Verifies format whitelisting (.pdf, .docx, .txt), 10MB size limit enforcement, UUID filename masking, physical file storage, ownership isolation (HTTP 403), file streaming, and physical file deletion.

### 3. Phase 5 Redis & Rate Limiting Test (`backend/test_phase5_redis.py`)
```bash
cd backend
python test_phase5_redis.py
```
- Verifies Redis client initialization, FakeRedis fallback, document metadata caching, dashboard statistics caching, cache invalidation, and sliding-window rate limiting.

### 4. Phase 6 Admin Module & Analytics Test (`backend/test_phase6_admin.py`)
```bash
cd backend
python test_phase6_admin.py
```
- Verifies Admin user list pagination (`GET /admin/users`), status toggle (`PATCH /admin/users/{id}/status`), role modification (`PATCH /admin/users/{id}/role`), system-wide document list (`GET /admin/documents`), Redis-cached admin analytics (`GET /admin/analytics`), and activity audit logging (`GET /admin/activity-logs`).

## 9.2 TypeScript Verification & Health Diagnostics

```bash
# TypeScript compilation check (0 errors)
cd frontend
npx tsc --noEmit

# Diagnostic Health Endpoint verification
curl http://localhost:8000/health
```

## 9.3 Future Enhancements

| Area | Current Implementation | Proposed Future Enhancement |
| :--- | :--- | :--- |
| **Storage Layer** | Local disk directory (`/app/uploads`) | AWS S3 / Google Cloud Storage bucket driver. |
| **Search Engine** | SQL exact filename matching | Elasticsearch / PostgreSQL Full-Text Search for document content indexing. |
| **AI Workflows** | Document metadata Persistence | Vector embeddings (LangChain / LlamaIndex) for RAG semantic search over uploaded PDFs. |
| **Authentication** | Standard JWT HTTP-only Cookies | OAuth2 Social Login (Google, GitHub SSO) & Multi-Factor Authentication (TOTP MFA). |

<div style="page-break-after: always; break-after: page;"></div>

---

# Chapter 10: Chronological Project Development Journey

## 10.1 Phase 0 through Phase 7 History

### Phase 0 — Architecture & Planning
- Formulated multi-phase roadmap and designed ER diagram for `User`, `Document`, and `ActivityLog`.
- Selected core tech stack: Next.js 16 (App Router), FastAPI, PostgreSQL 16, Redis 7, Docker.

### Phase 1 — Frontend Foundation
- Initialized Next.js 16 application with TypeScript and Tailwind CSS.
- Designed glassmorphism dark-mode UI layout and implemented Recharts visualization components (`UploadTrendChart`, `FileTypeChart`, `StorageUsageChart`, `UserRoleChart`).

### Phase 2 — Backend Foundation
- Configured FastAPI backend entrypoint with Pydantic v2 `BaseSettings`.
- Set up SQLAlchemy 2.0 AsyncSession with PostgreSQL and SQLite fallback.
- Generated initial Alembic database migration (`001_initial_models.py`).

### Phase 3 — Authentication & RBAC
- Implemented Argon2id password hashing and PyJWT token generation with HTTP-only cookies.
- Added dependency functions (`get_current_active_user`, `require_admin`).
- Hardened public registration to enforce default `USER` role.

### Phase 4 — Document Management & Local Storage
- Built document upload endpoint validating extensions (.pdf, .docx, .txt) and 10MB size limit.
- Saved files to `backend/uploads/` with UUID filename masking.
- Implemented ownership isolation (HTTP 403) for metadata, downloading, and deletion.

### Phase 5 — Redis Integration & Rate Limiting
- Integrated `redis.asyncio` with FakeRedis fallback.
- Created `cache_service.py` to cache user document lists, user stats, and admin analytics.
- Built `RateLimiterDependency` implementing atomic Redis sliding-window rate limiting on login and upload endpoints.

### Phase 6 — Admin Module & Full Live Integration
- Built administrative endpoints (`/admin/users`, `/admin/analytics`, `/admin/activity-logs`).
- Connected Next.js pages (`/dashboard`, `/documents`, `/upload`, `/admin`, `/admin/users`, `/admin/health`) to live API data, purging 100% of mock data dependencies.
- Added UI badges and backend API guard rails protecting `admin@docflow.io` and active admin sessions from accidental self-demotion or self-disabling.

### Phase 7 — Docker & Docker Compose Containerization
- Containerized FastAPI backend (`Python 3.11 slim`) and Next.js frontend (`Node 20 Alpine multi-stage`).
- Configured `docker-compose.yml` linking `postgres`, `redis`, `backend`, and `frontend` on bridge network.
- Fixed environment variable resolution in `config.py` to support container service names (`POSTGRES_SERVER=postgres`, `REDIS_HOST=redis`).
