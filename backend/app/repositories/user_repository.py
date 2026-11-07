from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, **fields) -> User:
        user = User(**fields)
        self.db.add(user)
        self.db.flush()
        return user

    def count_admins(self) -> int:
        return (
            self.db.query(func.count(User.id))
            .filter(User.role == "admin")
            .scalar()
            or 0
        )

    def update(self, user: User, **fields) -> User:
        for key, value in fields.items():
            setattr(user, key, value)
        self.db.flush()
        return user
