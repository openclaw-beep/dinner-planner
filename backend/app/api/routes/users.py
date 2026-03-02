from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import generate_api_token, mask_phone_number, sanitize_text
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    user = User(
        name=sanitize_text(payload.name, max_length=120),
        phone_number=payload.phone_number,
        auth_token=generate_api_token(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserRead(
        id=user.id,
        name=user.name,
        phone_number=mask_phone_number(user.phone_number),
        auth_token=user.auth_token,
        created_at=user.created_at,
    )
