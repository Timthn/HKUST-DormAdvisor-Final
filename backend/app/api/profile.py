"""
User Profile API Endpoints
Manages user preferences and profile data
"""
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ProfileCreate, ProfileUpdate, ProfileResponse
from app.middleware.auth import get_current_user_id
from app.database.supabase_client import get_supabase, get_dev_storage
from datetime import datetime
import os

router = APIRouter()

DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"


@router.get("/", response_model=ProfileResponse)
async def get_profile(
    user_id: str = Depends(get_current_user_id)
):
    """
    Get current user's profile
    
    Returns:
        User profile data
    """
    # Development mode: use in-memory storage
    if DEV_MODE:
        storage = get_dev_storage()
        if user_id not in storage:
            raise HTTPException(status_code=404, detail="Profile not found")
        return ProfileResponse(**storage[user_id])
    
    # Production mode: use Supabase
    supabase = get_supabase()
    
    try:
        response = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return ProfileResponse(**response.data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")


@router.post("/", response_model=ProfileResponse)
async def create_or_update_profile(
    profile: ProfileCreate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Create or update user profile
    
    Args:
        profile: Profile data to create/update
        user_id: Authenticated user ID
        
    Returns:
        Updated profile
    """
    profile_data = {
        'id': user_id,
        'identity': profile.identity,
        'budget_range': profile.budget_range,
        'preferences': profile.preferences.dict(),
        'updated_at': datetime.now().isoformat()
    }
    
    # Development mode: use in-memory storage
    if DEV_MODE:
        storage = get_dev_storage()
        storage[user_id] = profile_data
        print(f"[DEV_MODE] Saved profile for user {user_id}")
        return ProfileResponse(**profile_data)
    
    # Production mode: use Supabase
    supabase = get_supabase()
    
    try:
        # Upsert profile (insert or update if exists)
        response = supabase.table('profiles').upsert(profile_data).execute()
        
        return ProfileResponse(**response.data[0])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")


@router.patch("/", response_model=ProfileResponse)
async def update_profile_partial(
    profile_update: ProfileUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Partially update user profile
    
    Args:
        profile_update: Fields to update (all optional)
        user_id: Authenticated user ID
        
    Returns:
        Updated profile
    """
    # Build update dict with only provided fields
    update_data = {'updated_at': datetime.now().isoformat()}
    
    if profile_update.identity is not None:
        update_data['identity'] = profile_update.identity
    if profile_update.budget_range is not None:
        update_data['budget_range'] = profile_update.budget_range
    if profile_update.preferences is not None:
        update_data['preferences'] = profile_update.preferences.dict()
    
    # Development mode: use in-memory storage
    if DEV_MODE:
        storage = get_dev_storage()
        if user_id not in storage:
            raise HTTPException(status_code=404, detail="Profile not found")
        storage[user_id].update(update_data)
        print(f"[DEV_MODE] Updated profile for user {user_id}")
        return ProfileResponse(**storage[user_id])
    
    # Production mode: use Supabase
    supabase = get_supabase()
    
    try:
        response = supabase.table('profiles').update(update_data).eq('id', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return ProfileResponse(**response.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")
