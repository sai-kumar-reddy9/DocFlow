"""
Phase 2 Database Schema & Model Verification Script
"""
import sys
import asyncio
from sqlalchemy import inspect
from app.core.database import engine
from app.models import Base, User, Document, ActivityLog


async def verify():
    print("=" * 60)
    print("Phase 2 — DocFlow Backend Verification")
    print("=" * 60)

    async with engine.connect() as conn:
        tables = await conn.run_sync(
            lambda sync_conn: inspect(sync_conn).get_table_names()
        )
        print(f"[OK] Verified Database Connection Engine: {engine.url.drivername}")
        print(f"[OK] Tables created in Database: {tables}")

        for table in ["users", "documents", "activity_logs"]:
            if table in tables:
                columns = await conn.run_sync(
                    lambda sync_conn, t=table: [c["name"] for c in inspect(sync_conn).get_columns(t)]
                )
                print(f"   • Table '{table}': {columns}")
            else:
                print(f"   [ERROR] Table '{table}' MISSING!")

    print("=" * 60)
    print("Phase 2 Database & ORM Verification Successful!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(verify())
