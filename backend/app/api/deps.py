from typing import Dict, Any, Optional
from fastapi import Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import extract_bearer_token, decode_and_validate_jwt
from app.db.session import get_db
from app.core.exceptions import AppError
from starlette.status import HTTP_403_FORBIDDEN

async def get_current_user(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    token = extract_bearer_token(authorization)
    payload = decode_and_validate_jwt(token, expected_type="access")
    return {"user_id": payload["sub"], "roles": payload.get("roles", [])}

def require_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if "admin" not in user.get("roles", []):
        raise AppError("Admin role required", status_code=HTTP_403_FORBIDDEN, code="FORBIDDEN")
    return user

async def get_client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"
