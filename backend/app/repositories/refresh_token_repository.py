from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_hash(self, token_hash: str) -> RefreshToken | None:
        return (
            self.db.query(RefreshToken)
            .filter(RefreshToken.token_hash == token_hash)
            .first()
        )

    def create(
        self, user_id: int, token_hash: str, expires_at: datetime
    ) -> RefreshToken:
        record = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.db.add(record)
        self.db.flush()
        return record

    def revoke(self, record: RefreshToken) -> None:
        record.revoked_at = datetime.now(timezone.utc)
        self.db.flush()

    def revoke_all_for_user(self, user_id: int) -> None:
        records = (
            self.db.query(RefreshToken)
            .filter(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
            )
            .all()
        )
        for record in records:
            record.revoked_at = datetime.now(timezone.utc)
        self.db.flush()
