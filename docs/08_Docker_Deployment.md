# 08 — Docker & Deployment Guide

## 🐳 Containerization Architecture

The DocFlow application is containerized using Docker and orchestrated via Docker Compose. No local installations of Python, Node.js, PostgreSQL, or Redis are required on the host system.

---

## 📄 1. Backend Dockerfile Breakdown (`backend/Dockerfile`)

```dockerfile
# Python 3.11 Slim Base Image
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (curl for healthchecks, gcc/libpq for asyncpg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Prepare uploads directory & entrypoint script
RUN mkdir -p /app/uploads && chmod +x /app/entrypoint.sh

EXPOSE 8000

# Run container startup script (Alembic migration + Uvicorn)
ENTRYPOINT ["/app/entrypoint.sh"]
```

---

## 📄 2. Frontend Dockerfile Breakdown (`frontend/Dockerfile`)

Uses a 3-stage multi-stage build to reduce final image size and enforce container security.

```dockerfile
# Stage 1: Dependency Installation
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Stage 3: Production Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for container security
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

---

## 🐙 3. Docker Compose Orchestration (`docker-compose.yml`)

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

---

## 🚀 4. Deployment & Management Commands

### Start Container Stack
```bash
# Build and launch all services in detached mode
docker compose up -d --build
```

### Stop & Clean Up Volumes
```bash
# Stop containers and remove persistent volumes
docker compose down -v
```

### Rebuild Code Changes
```bash
# Rebuild containers after source code edits
docker compose up -d --build --force-recreate
```

### Execute Seeding or CLI Commands Inside Containers
```bash
# Create/Promote Admin account inside backend container
docker compose exec backend python seed_admin.py admin@docflow.io AdminPassword123!
```

---

## 🛠 5. Troubleshooting Guide

### Issue: PostgreSQL "FATAL: role 'postgres' does not exist"
- **Root Cause**: Host volume `postgres_data` contains files initialized from an earlier interrupted run.
- **Fix**: Remove the stale volume and restart:
  ```bash
  docker compose down -v
  docker compose up -d --build
  ```

### Issue: Backend Cannot Connect to Database (`localhost:5432`)
- **Root Cause**: `backend/.env` contained hardcoded `DATABASE_URL=...localhost:5432...`.
- **Fix**: Ensure `config.py` uses `POSTGRES_SERVER=postgres` inside Docker.
