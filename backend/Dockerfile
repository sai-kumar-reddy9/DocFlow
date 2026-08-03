# Python Slim Official Image for FastAPI Backend
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (curl for healthchecks, gcc/libpq for DB connectors)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Ensure uploads directory exists and entrypoint script is executable
RUN mkdir -p /app/uploads && chmod +x /app/entrypoint.sh

# Expose FastAPI application port
EXPOSE 8000

# Container entrypoint runs Alembic migrations then starts Uvicorn
ENTRYPOINT ["/app/entrypoint.sh"]
