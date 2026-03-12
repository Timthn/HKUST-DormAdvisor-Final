"""
Pydantic Models for Request/Response Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ---------- User Profile Models ----------

class FormPreferences(BaseModel):
    """Structured representation of SetupForm user input"""
    identity: str = Field(..., description="Local Undergraduate / Non-Local Undergraduate / Exchange Student")
    gender: Optional[str] = None
    budget_range: str = Field(..., description="e.g. 'HK$ 15,000 - 20,000'")
    room_types: List[str] = Field(default_factory=list)
    priorities: List[str] = Field(default_factory=list)
    additional_info: Optional[str] = None


class ProfileUpdate(BaseModel):
    """Profile update schema — all fields optional, used by POST /api/profile/"""
    form_preferences: Optional[FormPreferences] = None


class ProfileResponse(BaseModel):
    """Profile response schema"""
    user_id: str
    form_preferences: Optional[Dict[str, Any]] = None
    inferred_preferences: Optional[str] = None
    memory_id: Optional[str] = None
    last_recommendation: Optional[Any] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- Chat Models ----------

class ChatMessage(BaseModel):
    """Chat message request"""
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    """Non-streaming chat response (kept for fallback / history)"""
    answer: str
    timestamp: datetime = Field(default_factory=datetime.now)


# ---------- Recommendation Models ----------

class HallRecommendationItem(BaseModel):
    """Single hall in recommendation result"""
    hall_id: str
    name: str
    reason: str
    image_url: Optional[str] = None
    price_info: Optional[Any] = None
    facilities: Optional[List[str]] = None
    website_url: Optional[str] = None


class RecommendationResponse(BaseModel):
    """Recommendation API response"""
    recommendations: List[HallRecommendationItem]
    timestamp: datetime = Field(default_factory=datetime.now)


# ---------- Auth Models ----------

class TokenData(BaseModel):
    """JWT token payload"""
    user_id: str
    email: Optional[str] = None
