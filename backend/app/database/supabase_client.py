"""
Supabase Database Client
"""
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

# In-memory storage for dev mode
_dev_storage = {}

DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"


class SupabaseClient:
    """Singleton Supabase client"""
    _instance: Optional[Client] = None

    @classmethod
    def get_client(cls) -> Optional[Client]:
        """Get or create Supabase client instance"""
        # In dev mode, return None to use in-memory storage
        if DEV_MODE:
            return None
            
        if cls._instance is None:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
            
            cls._instance = create_client(supabase_url, supabase_key)
        
        return cls._instance


# Convenience function
def get_supabase() -> Optional[Client]:
    """Get Supabase client instance"""
    return SupabaseClient.get_client()


def get_dev_storage():
    """Get in-memory storage for development mode"""
    return _dev_storage
