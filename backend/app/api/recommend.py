"""
Recommendation API Endpoints
Generates personalized hall recommendations
"""
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import RecommendationResponse
from app.middleware.auth import get_current_user_id
from app.services.recommendation_service import get_recommendation_service

router = APIRouter()


@router.post("/", response_model=RecommendationResponse)
async def generate_recommendations(
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate personalized hall recommendations
    
    Flow:
    1. Verify user authentication
    2. Fetch user profile from database
    3. Generate recommendations using AI
    4. Return structured recommendation response
    
    Note: Request body is empty because backend fetches latest profile from DB
    """
    rec_service = get_recommendation_service()
    
    try:
        # Use user_id as session_id for context continuity
        result = await rec_service.generate_recommendations(user_id, user_id)
        
        return RecommendationResponse(
            advisor_comment=result.get("advisor_comment", ""),
            recommendations=result.get("recommendations", [])
        )
        
    except Exception as e:
        print(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation service error: {str(e)}")


@router.get("/refresh")
async def refresh_recommendations(
    user_id: str = Depends(get_current_user_id)
):
    """
    Alias endpoint for regenerating recommendations
    Same as POST / but more RESTful for refresh action
    """
    return await generate_recommendations(user_id)
