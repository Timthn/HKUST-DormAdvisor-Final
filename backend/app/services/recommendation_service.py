"""
Recommendation Service
Generates personalized hall recommendations
"""
from typing import List
from app.models.schemas import HallRecommendation
from app.services.bailian_service import get_bailian_service
from app.database.supabase_client import get_supabase


class RecommendationService:
    """Service for generating hall recommendations"""
    
    def __init__(self):
        self.bailian = get_bailian_service()
        self.supabase = get_supabase()
    
    async def generate_recommendations(
        self, 
        user_id: str,
        session_id: str
    ) -> dict:
        """
        Generate recommendations based on user profile
        
        Args:
            user_id: User's unique ID
            session_id: Current session ID
            
        Returns:
            dict: Recommendation response with advisor_comment and recommendations list
        """
        # Step 1: Fetch user profile from Supabase
        try:
            profile_response = self.supabase.table('profiles').select('*').eq('id', user_id).single().execute()
            profile = profile_response.data
        except Exception as e:
            print(f"Error fetching profile: {e}")
            # Return default recommendation
            return {
                "advisor_comment": "Unable to load your profile. Please update your preferences.",
                "recommendations": []
            }
        
        # Step 2: Construct prompt for LLM
        identity = profile.get('identity', 'Undergraduate')
        budget = profile.get('budget_range', 'HK$ 3000 - 5000')
        preferences = profile.get('preferences', {})
        room_types = preferences.get('room_types', [])
        priorities = preferences.get('priorities', [])
        
        prompt = f"""
Based on the following user profile, provide personalized hall recommendations:

Identity: {identity}
Budget: {budget}
Preferred Room Types: {', '.join(room_types) if room_types else 'Any'}
Priorities: {', '.join(priorities) if priorities else 'None'}

Please provide:
1. A brief advisor comment (40-60 words)
2. Top 3 hall recommendations with:
   - Hall name
   - 2-3 relevant feature tags
   - Match score (0-100)
   - Brief reason for recommendation

Format your response as JSON:
{{
  "advisor_comment": "...",
  "recommendations": [
    {{"name": "Hall IV", "tags": ["Renovated", "Balanced"], "score": 95, "reason": "..."}},
    ...
  ]
}}
"""
        
        # Step 3: Call Bailian API
        response = await self.bailian.send_message(prompt, session_id)
        
        # Step 4: Parse response (in production, add proper JSON parsing)
        # For now, return a structured response
        try:
            import json
            parsed = json.loads(response)
            return parsed
        except:
            # Fallback if JSON parsing fails
            return {
                "advisor_comment": response[:200],  # Truncate
                "recommendations": self._get_default_recommendations(budget)
            }
    
    def _get_default_recommendations(self, budget: str) -> List[dict]:
        """Generate default recommendations based on budget"""
        # Simple logic based on budget range
        if "8000" in budget or "5000-8000" in budget:
            return [
                {"name": "Hall IV", "tags": ["Top Pick", "Renovated"], "score": 95, "reason": "Best facilities within budget"},
                {"name": "Hall VI", "tags": ["Sea View", "Modern"], "score": 90, "reason": "Stunning views and active community"},
                {"name": "Hall II", "tags": ["Sea View", "Value"], "score": 85, "reason": "Good value with ocean view"}
            ]
        else:
            return [
                {"name": "Hall I", "tags": ["Social Hub", "Budget"], "score": 90, "reason": "Best value for social students"},
                {"name": "Hall V", "tags": ["Quiet", "Single"], "score": 85, "reason": "Privacy at affordable price"},
                {"name": "Hall II", "tags": ["Sea View", "Value"], "score": 80, "reason": "Decent budget option with view"}
            ]


# Singleton instance
_recommendation_service = None


def get_recommendation_service() -> RecommendationService:
    """Get or create recommendation service instance"""
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
    return _recommendation_service
