"""
JWT Authentication Middleware
Supports Supabase JWTs: HS256 (JWT Secret) and RS256 (JWKS).
"""
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
from typing import Optional

import jwt
from jwt import PyJWKClient
from jwt.exceptions import PyJWTError

from app.models.schemas import TokenData

load_dotenv()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"
SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
SUPABASE_JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json" if SUPABASE_URL else ""

# HTTPBearer with auto_error=False allows optional authentication
security = HTTPBearer(auto_error=not DEV_MODE)


def _decode_supabase_jwt(token: str) -> dict:
    """Decode Supabase JWT: RS256 via JWKS or HS256 via JWT_SECRET."""
    try:
        unverified = jwt.get_unverified_header(token)
    except PyJWTError:
        raise
    alg = (unverified.get("alg") or "").upper()

    if alg in ("RS256", "ES256") and SUPABASE_JWKS_URL:
        # Supabase cloud may use RS256 or ES256; verify with public key from JWKS
        jwks_client = PyJWKClient(SUPABASE_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            options={"verify_aud": False},
        )
        return payload

    # HS256 (legacy / custom): verify with JWT Secret from Supabase Dashboard → API → JWT Secret
    payload = jwt.decode(
        token,
        JWT_SECRET,
        algorithms=[JWT_ALGORITHM],
    )
    return payload


async def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> TokenData:
    """
    Verify JWT token and extract user information.

    Supports Supabase: RS256 (JWKS) and HS256 (JWT Secret).
    In DEV_MODE, returns a test user if no credentials provided.
    """
    if DEV_MODE and credentials is None:
        print("[DEV_MODE] Using test user (no authentication)")
        return TokenData(user_id="test-user-123", email="test@example.com")

    if credentials is None:
        print("[Auth] 401: No Authorization header (frontend may not be sending token)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = _decode_supabase_jwt(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return TokenData(user_id=user_id, email=payload.get("email"))
    except PyJWTError as e:
        print(f"[Auth] 401: JWT invalid (wrong secret or expired). Error: {e}")
        raise credentials_exception


async def get_current_user_id(token_data: TokenData = Security(verify_token)) -> str:
    """
    Extract user_id from verified token
    
    Args:
        token_data: Verified token data
        
    Returns:
        str: User ID
    """
    return token_data.user_id
