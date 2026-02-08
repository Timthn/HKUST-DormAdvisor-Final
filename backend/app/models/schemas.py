"""
Pydantic Models for Request/Response Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ---------- User Profile Models ----------

class UserPreferences(BaseModel):
    """User preference settings"""
    room_types: List[str] = Field(default_factory=list, description="Preferred room types")
    priorities: List[str] = Field(default_factory=list, description="Priority tags")
    additional_info: Optional[str] = Field(None, description="Additional requirements")


class ProfileBase(BaseModel):
    """Base profile schema"""
    identity: str = Field(..., description="Student identity: Undergraduate/Postgraduate/Exchange")
    budget_range: str = Field(..., description="Budget range (e.g., 'HK$ 3000 - 5000')")
    preferences: UserPreferences = Field(default_factory=UserPreferences)


class ProfileCreate(ProfileBase):
    """Profile creation schema"""
    pass


class ProfileUpdate(BaseModel):
    """Profile update schema (all fields optional)"""
    identity: Optional[str] = None
    budget_range: Optional[str] = None
    preferences: Optional[UserPreferences] = None


class ProfileResponse(ProfileBase):
    """Profile response schema"""
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Chat Models ----------

class ChatMessage(BaseModel):
    """Chat message schema"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")


class ChatResponse(BaseModel):
    """Chat response schema"""
    answer: str = Field(..., description="AI generated answer")
    rag_source: Optional[str] = Field(None, description="Source document if RAG was used")
    timestamp: datetime = Field(default_factory=datetime.now)


class ChatHistory(BaseModel):
    """Chat history entry"""
    id: int
    role: str = Field(..., description="'user' or 'assistant'")
    content: str
    created_at: datetime


# ---------- Recommendation Models ----------

class HallRecommendation(BaseModel):
    """Single hall recommendation"""
    name: str = Field(..., description="Hall name")
    tags: List[str] = Field(default_factory=list, description="Feature tags")
    score: int = Field(..., ge=0, le=100, description="Match score (0-100)")
    reason: Optional[str] = Field(None, description="Recommendation reason")


class RecommendationResponse(BaseModel):
    """Recommendation API response"""
    advisor_comment: str = Field(..., description="AI advisor's summary comment")
    recommendations: List[HallRecommendation] = Field(..., max_items=5, description="Top hall recommendations")
    timestamp: datetime = Field(default_factory=datetime.now)


# ---------- Hall Facility Models ----------

class HallDetails(BaseModel):
    """Hall facility details"""
    name: str
    avg_price: str
    room_types: str
    ac: str
    bathroom: str
    gym: str
    common: str
    laundry: str
    features: str
    tags: Optional[List[str]] = None
    tag_color: Optional[str] = None


# ---------- Auth Models ----------

class TokenData(BaseModel):
    """JWT token payload"""
    user_id: str
    email: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str
    error_code: Optional[str] = None
