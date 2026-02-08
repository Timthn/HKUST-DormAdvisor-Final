"""
JWT Authentication Middleware
"""
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
from typing import Optional

from app.models.schemas import TokenData

load_dotenv()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

# HTTPBearer with auto_error=False allows optional authentication
security = HTTPBearer(auto_error=not DEV_MODE)


async def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> TokenData:
    """
    Verify JWT token and extract user information
    
    In DEV_MODE, returns a test user if no credentials provided.
    
    Args:
        credentials: HTTP Bearer token from request header (optional in DEV_MODE)
        
    Returns:
        TokenData: Parsed token data containing user_id
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    # Development mode: Allow access without authentication
    if DEV_MODE and credentials is None:
        print("[DEV_MODE] Using test user (no authentication)")
        return TokenData(user_id="test-user-123", email="test@example.com")
    
    # Production mode: Require authentication
    if credentials is None:
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
        # Decode JWT token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
        token_data = TokenData(user_id=user_id, email=payload.get("email"))
        return token_data
        
    except JWTError:
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
