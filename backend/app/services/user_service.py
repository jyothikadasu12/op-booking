from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def get_by_id(self, user_id: int):
        return self.users.get_by_id(user_id)

    def get_by_email(self, email: str):
        return self.users.get_by_email(email)

    def update_profile(self, user_id: int, payload: UserUpdate):
        user = self.users.get_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        changes = payload.model_dump(exclude_unset=True)
        if not changes:
            return user

        # Never allow role changes through profile update.
        changes.pop("role", None)
        changes.pop("email", None)

        user = self.users.update(user, **changes)
        self.db.commit()
        self.db.refresh(user)
        return user
