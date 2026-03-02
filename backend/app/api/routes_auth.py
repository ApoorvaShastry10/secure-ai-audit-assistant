from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_401_UNAUTHORIZED
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.db.models import User
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_and_validate_jwt
from app.core.exceptions import AppError

router = APIRouter(prefix="/auth")

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    res = await db.execute(select(User).options(selectinload(User.roles)).where(User.email == req.email))
    user = res.scalar_one_or_none()
    if not user or not user.is_active or not verify_password(req.password, user.password_hash):
        raise AppError("Invalid credentials", status_code=HTTP_401_UNAUTHORIZED, code="AUTH_INVALID_CREDENTIALS")
    roles = [r.name for r in user.roles]
    return TokenResponse(
        access_token=create_access_token(user_id=user.id, roles=roles),
        refresh_token=create_refresh_token(user_id=user.id),
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    payload = decode_and_validate_jwt(req.refresh_token, expected_type="refresh")
    user_id = payload["sub"]
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user or not user.is_active:
        raise AppError("Invalid refresh token", status_code=HTTP_401_UNAUTHORIZED, code="AUTH_INVALID_REFRESH")
    roles = [r.name for r in user.roles]
    return TokenResponse(
        access_token=create_access_token(user_id=user.id, roles=roles),
        refresh_token=create_refresh_token(user_id=user.id),
    )
