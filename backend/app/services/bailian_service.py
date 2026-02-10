"""
Alibaba Cloud Bailian (Model Studio) Service
Migrated from frontend to backend
"""
import httpx
import os
from dotenv import load_dotenv
from typing import Optional, Dict, Any

from app.utils.constants import SYSTEM_INSTRUCTION

load_dotenv()


class BailianService:
    """Alibaba Cloud Bailian API Service"""
    
    def __init__(self):
        self.api_key = os.getenv("BAILIAN_API_KEY")
        self.app_id = os.getenv("BAILIAN_APP_ID")
        self.base_url = f"https://dashscope.aliyuncs.com/api/v1/apps/{self.app_id}/completion"
        
        if not self.api_key or not self.app_id:
            raise ValueError("BAILIAN_API_KEY and BAILIAN_APP_ID must be set in environment variables")
    
    async def send_message(
        self, 
        prompt: str, 
        session_id: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Send a message to Bailian Agent
        
        Args:
            prompt: User's input message
            session_id: Optional session ID for maintaining context
            system_prompt: Optional custom system prompt (defaults to SYSTEM_INSTRUCTION)
            
        Returns:
            str: AI generated response
        """
        if not self.app_id or self.app_id == "YOUR_APP_ID_HERE":
            return "Error: App ID is not configured. Please set BAILIAN_APP_ID in .env file."
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload: Dict[str, Any] = {
                "input": {
                    "prompt": prompt
                },
                "parameters": {
                    "incremental_output": False
                },
                "debug": {}
            }
            
            # Add session_id if provided
            if session_id:
                payload["input"]["session_id"] = session_id
            
            # Add system prompt if provided
            if system_prompt:
                payload["input"]["system"] = system_prompt
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    error_data = response.json() if response.content else {}
                    print(f"Bailian API Error: {error_data}")
                    return f"API Request failed with status {response.status_code}"
                
                data = response.json()
                return data.get("output", {}).get("text", "I'm sorry, I couldn't generate a response.")
                
        except httpx.TimeoutException:
            return "Request timeout. Please try again."
        except Exception as e:
            print(f"Bailian Service Error: {e}")
            return "Network connection issue or API configuration error."
    
    async def generate_analysis(
        self, 
        identity: str,
        budget: str,
        room_types: list,
        priorities: list,
        additional_info: str = "",
        session_id: Optional[str] = None
    ) -> str:
        """
        Generate initial dorm analysis based on user profile
        
        Args:
            identity: Student identity (Undergraduate/Postgraduate/Exchange)
            budget: Budget range
            room_types: List of preferred room types
            priorities: List of priority features
            additional_info: Additional user requirements
            session_id: Optional session ID
            
        Returns:
            str: AI generated analysis
        """
        prompt = f"""
User Profile:
- Identity: {identity}
- Budget: {budget}
- Preferred Rooms: {', '.join(room_types) if room_types else 'Any'}
- Priorities: {', '.join(priorities) if priorities else 'None'}
- Extra Info: {additional_info}

Task: As the Dorm Advisor Agent, please review this profile and provide a personalized "Dorm Recommendation Summary" (approx 80-100 words).
Directly suggest 2-3 Halls that fit the user's needs and explain why briefly.
Do not use markdown headers (###), just paragraphs.
"""
        
        return await self.send_message(prompt, session_id, SYSTEM_INSTRUCTION)


# Singleton instance
_bailian_service: Optional[BailianService] = None


def get_bailian_service() -> BailianService:
    """Get or create Bailian service instance"""
    global _bailian_service
    if _bailian_service is None:
        _bailian_service = BailianService()
    return _bailian_service
