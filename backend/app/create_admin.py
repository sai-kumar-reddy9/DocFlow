import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.services import user_service
from app.schemas.user import UserCreate


async def create_admin():
    email = sys.argv[1] if len(sys.argv) > 1 else "admin@docflow.io"
    password = sys.argv[2] if len(sys.argv) > 2 else "AdminPassword123!"
    full_name = sys.argv[3] if len(sys.argv) > 3 else "System Administrator"

    print(f"==> Processing Admin Account for: {email}")

    async with AsyncSessionLocal() as db:
        existing_user = await user_service.get_user_by_email(db, email)
        if existing_user:
            print(f"User '{email}' already exists. Updating role to ADMIN...")
            await user_service.update_user_role(db, existing_user, "ADMIN")
            print(f"  [OK] User '{email}' promoted to ADMIN role.")
        else:
            user_in = UserCreate(email=email, password=password, full_name=full_name)
            new_admin = await user_service.create_user(db, user_in, role="ADMIN")
            print(f"  [OK] Admin account created for '{email}' (ID: {new_admin.id}).")

    print("\n=======================================================")
    print("           ADMIN LOGIN CREDENTIALS                     ")
    print("=======================================================")
    print(f"  Email:    {email}")
    print(f"  Password: {password}")
    print("=======================================================\n")


if __name__ == "__main__":
    asyncio.run(create_admin())
