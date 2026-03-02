import time
from typing import Any, Dict, List, Optional
import jwt
from passlib.context import CryptContext
from starlette.status import HTTP_401_UNAUTHORIZED
from app.core.config import settings
from app.core.exceptions import AppError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password, rounds=settings.password_bcrypt_rounds)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def _now() -> int:
    return int(time.time())

def create_access_token(*, user_id: str, roles: List[str]) -> str:
    now=_now()
    payload: Dict[str, Any] = {
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "sub": user_id,
        "roles": roles,
        "iat": now,
        "exp": now + settings.jwt_access_ttl_seconds,
        "typ": "access",
    }
    return jwt.encode(payload, settings.jwt_signing_key, algorithm="HS256")

def create_refresh_token(*, user_id: str) -> str:
    now=_now()
    payload: Dict[str, Any] = {
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "sub": user_id,
        "iat": now,
        "exp": now + settings.jwt_refresh_ttl_seconds,
        "typ": "refresh",
    }
    return jwt.encode(payload, settings.jwt_signing_key, algorithm="HS256")

def decode_and_validate_jwt(token: str, expected_type: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_signing_key,
            algorithms=["HS256"],
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
        )
    except jwt.ExpiredSignatureError:
        raise AppError("Token expired", status_code=HTTP_401_UNAUTHORIZED, code="JWT_EXPIRED")
    except jwt.InvalidTokenError:
        raise AppError("Invalid token", status_code=HTTP_401_UNAUTHORIZED, code="JWT_INVALID")
    if payload.get("typ") != expected_type:
        raise AppError("Invalid token type", status_code=HTTP_401_UNAUTHORIZED, code="JWT_WRONG_TYPE")
    return payload

def extract_bearer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise AppError("Missing Authorization header", status_code=HTTP_401_UNAUTHORIZED, code="AUTH_MISSING")
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise AppError("Invalid Authorization header", status_code=HTTP_401_UNAUTHORIZED, code="AUTH_INVALID")
    return parts[1].strip()
