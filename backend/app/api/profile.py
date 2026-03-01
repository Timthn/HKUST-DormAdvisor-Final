"""
User Profile API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ProfileUpdate, ProfileResponse
from app.middleware.auth import get_current_user_id
from app.database.supabase_client import get_supabase
from datetime import datetime, timezone

router = APIRouter()


@router.get("/", response_model=ProfileResponse)
async def get_profile(
    user_id: str = Depends(get_current_user_id)
):
    """Get current user's profile"""
    supabase = get_supabase()
    try:
        response = supabase.table('profiles').select('*').eq('user_id', user_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return ProfileResponse(**response.data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")


@router.post("/", response_model=ProfileResponse)
async def update_profile(
    profile: ProfileUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update user's form_preferences.
    Profile row is created by a Supabase DB trigger on auth.users signup.
    This endpoint only performs UPDATE — never INSERT.
    """
    supabase = get_supabase()

    update_data: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}

    if profile.form_preferences is not None:
        update_data["form_preferences"] = profile.form_preferences.model_dump()

    try:
        response = (
            supabase.table('profiles')
            .update(update_data)
            .eq('user_id', user_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found. Ensure the DB trigger created the row.")
        return ProfileResponse(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")
