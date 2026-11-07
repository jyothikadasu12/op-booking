from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def get_by_id(self, user_id: int):
        return self.users.get_by_id(user_id)

    def get_by_email(self, email: str):
        return self.users.get_by_email(email)
