import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.services import user_service
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


async def seed():
    target_email = sys.argv[1] if len(sys.argv) > 1 else "admin@docflow.io"
    target_password = sys.argv[2] if len(sys.argv) > 2 else "AdminPassword123!"
    full_name = sys.argv[3] if len(sys.argv) > 3 else "System Administrator"

    target_email = target_email.lower().strip()

    async with AsyncSessionLocal() as session:
        u = await user_service.get_user_by_email(session, target_email)
        if u:
            u.role = "ADMIN"
            u.is_active = True
            u.hashed_password = get_password_hash(target_password)
            await session.commit()
            await session.refresh(u)
            print(f"SUCCESS: Account '{target_email}' updated to ADMIN with password '{target_password}'.")
        else:
            new_user = await user_service.create_user(
                session,
                UserCreate(email=target_email, password=target_password, full_name=full_name),
                role="ADMIN"
            )
            print(f"SUCCESS: Created new ADMIN account '{target_email}' (ID: {new_user.id}) with password '{target_password}'.")


if __name__ == "__main__":
    asyncio.run(seed())
