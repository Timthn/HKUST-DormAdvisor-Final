"""
HKUST Dorm Advisor - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.api import chat, recommend, profile

# Load environment variables
load_dotenv()


# Initialize FastAPI app
app = FastAPI(
    title="HKUST Dorm Advisor API",
    description="Backend API for HKUST Dormitory Recommendation System",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    swagger_ui_parameters={"persistAuthorization": True},
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(recommend.router, prefix="/api/recommend", tags=["Recommendations"])
app.include_router(profile.router, prefix="/api/profile", tags=["User Profile"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HKUST Dorm Advisor API",
        "version": "2.0.0"
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "ok",
        "database": "connected",
        "ai_service": "ready"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
