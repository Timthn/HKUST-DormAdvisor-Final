"""
Recommendation API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import RecommendationResponse, HallRecommendationItem
from app.middleware.auth import get_current_user_id
from app.services.recommendation_service import get_recommendation_service

router = APIRouter()


@router.post("/", response_model=RecommendationResponse)
async def generate_recommendations(
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate personalized hall recommendations.
    No request body — backend reads from profiles table.
    """
    rec_service = get_recommendation_service()
    try:
        result = await rec_service.generate_recommendations(user_id)
        items = [HallRecommendationItem(**r) for r in result.get("recommendations", [])]
        return RecommendationResponse(recommendations=items)
    except Exception as e:
        print(f"[recommend] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/refresh", response_model=RecommendationResponse)
async def refresh_recommendations(
    user_id: str = Depends(get_current_user_id)
):
    """Alias to re-trigger recommendation generation"""
    return await generate_recommendations(user_id)
