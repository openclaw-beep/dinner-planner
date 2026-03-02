from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException
from fastapi.params import Depends as DependsMarker
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: int
    auth_token: str


@dataclass(frozen=True)
class AdminContext:
    restaurant_id: int | None


def _is_direct_invocation(value: object) -> bool:
    return isinstance(value, DependsMarker)


def require_user(
    x_user_token: str | None = Header(None),
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    if not x_user_token:
        raise HTTPException(status_code=401, detail="Missing user auth token")

    user = db.scalar(select(User).where(User.auth_token == x_user_token))
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid user auth token")

    return AuthenticatedUser(user_id=user.id, auth_token=user.auth_token)


def resolve_user_id_for_route(
    *,
    db: Session,
    current_user: AuthenticatedUser | DependsMarker,
    fallback_user_id: int | None = None,
) -> int:
    if isinstance(current_user, AuthenticatedUser):
        return current_user.user_id

    if _is_direct_invocation(current_user) and fallback_user_id is not None:
        user = db.scalar(select(User.id).where(User.id == fallback_user_id))
        if user is not None:
            return fallback_user_id

    raise HTTPException(status_code=401, detail="Unauthorized")


def require_admin(
    x_admin_token: str | None = Header(None),
    x_restaurant_id: int | None = Header(None),
) -> AdminContext:
    if not x_admin_token:
        raise HTTPException(status_code=401, detail="Missing admin token")

    if x_admin_token != settings.admin_api_token:
        raise HTTPException(status_code=403, detail="Invalid admin token")

    if x_restaurant_id is not None and x_restaurant_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid admin restaurant scope")

    return AdminContext(restaurant_id=x_restaurant_id)


def resolve_admin_for_route(
    admin_context: AdminContext | DependsMarker,
) -> AdminContext:
    if isinstance(admin_context, AdminContext):
        return admin_context
    if _is_direct_invocation(admin_context):
        return AdminContext(restaurant_id=None)
    raise HTTPException(status_code=401, detail="Unauthorized")
