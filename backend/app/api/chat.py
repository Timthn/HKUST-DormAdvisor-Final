"""
Chat API Endpoints
Handles chat interactions with AI advisor
"""
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ChatMessage, ChatResponse
from app.middleware.auth import get_current_user_id
from app.services.bailian_service import get_bailian_service
from app.database.supabase_client import get_supabase, get_dev_storage
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def send_chat_message(
    message: ChatMessage,
    user_id: str = Depends(get_current_user_id)
):
    """
    Send a chat message and get AI response
    
    Flow:
    1. Verify user authentication (via Depends)# ########## This may need to changed to supabase auth
    2. Fetch user profile from Supabase
    3. Fetch recent chat history
    4. Construct context-aware prompt # ########## This may need to changed to supabase auth
    5. Call Bailian API # ########## This may need to changed to supabase auth
    6. Store user message and AI response in database # ########## This may need to changed to supabase auth
    7. Return AI response # ########## This may need to changed to supabase auth
    """
    bailian = get_bailian_service()
    supabase = get_supabase()
    
    try:
        # Step 1: Get profile context (Use provided context if available, otherwise fetch from DB)
        if message.context:
            # Context provided by frontend (e.g. Guest mode)
            profile = message.context
            
            # For guests, we don't have stored history
            history = []
        elif supabase:
            # Authenticated user - fetch from Supabase
            try:
                profile_response = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
                profile = profile_response.data
            except Exception:
                profile = {}
            
            # Step 2: Fetch recent chat history (last 10 messages)
            try:
                history_response = supabase.table('chat_logs').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute()
                history = history_response.data
            except Exception:
                history = []
        else:
            # Dev mode fallback
            # ... existing dev mode logic ...
            storage = get_dev_storage()
            profile = storage.get(user_id, {})
            # ...
            history = []
        
        if not profile:
             # Fallback mock data if not found in RAM
            profile = {
                'identity': 'Undergraduate (Dev)',
                'budget_range': 'HK$ 5000 - 7000',
                'preferences': {'room_types': ['Single Room'], 'priorities': ['Price']}
            }

        # Step 3: Build context
        identity = profile.get('identity', 'Student')
        budget = profile.get('budget_range', 'Not specified')
        preferences = profile.get('preferences', {})
        
        context_prompt = f"""
[User Context]
- Identity: {identity}
- Budget: {budget}
- Preferences: {preferences}

[User Question]
{message.message}

Please provide a helpful response based on the user's context and question.
"""
        
        # Step 4: Call Bailian API
        # Use user_id as session_id to maintain conversation context
        ai_response = await bailian.send_message(context_prompt, session_id=user_id)
        
        # Step 5: Store chat logs
        if supabase:
            timestamp = datetime.now().isoformat()
            
            # Store user message
            supabase.table('chat_logs').insert({
                'user_id': user_id,
                'role': 'user',
                'content': message.message,
                'created_at': timestamp
            }).execute()
            
            # Store AI response
            supabase.table('chat_logs').insert({
                'user_id': user_id,
                'role': 'assistant',
                'content': ai_response,
                'created_at': timestamp
            }).execute()
        else:
            print(f"[DEV_MODE] Skipping DB log: User: {message.message} -> AI: {ai_response[:50]}...")
        
        # Step 6: Return response
        return ChatResponse(
            answer=ai_response,
            rag_source=None,  # TODO: Implement RAG source tracking
            timestamp=datetime.now()
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")


@router.get("/history")
async def get_chat_history(
    limit: int = 50,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get user's chat history
    
    Args:
        limit: Maximum number of messages to return
        user_id: Authenticated user ID
        
    Returns:
        List of chat messages
    """
    supabase = get_supabase()
    
    try:
        response = supabase.table('chat_logs').select('*').eq('user_id', user_id).order('created_at', desc=False).limit(limit).execute()
        return {"messages": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {str(e)}")
