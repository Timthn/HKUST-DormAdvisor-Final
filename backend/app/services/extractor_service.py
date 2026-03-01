"""
Extractor Service
Analyses chat history to infer hidden user preferences using DeepSeek.
Triggered asynchronously from chat.py after every 20th user message.
"""
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

from app.database.supabase_client import get_supabase

load_dotenv()

EXTRACTOR_SYSTEM_PROMPT = """You are a dormitory preference analyst for HKUST.
Your task is to read a student's conversation with a dorm advisor chatbot and extract HIDDEN or IMPLICIT preferences about dormitory living that the student did NOT explicitly state in a preference form.

Focus on signals such as:
- Real social habits (e.g., prefers quiet nights vs. late-night socialising)
- Actual study schedule and noise sensitivity
- Attitude toward shared spaces and cleanliness
- Desire for single vs. multi-occupancy based on conversation tone
- Any specific facilities or location concerns mentioned casually

Output ONLY a concise English paragraph (maximum 150 words). 
Do NOT use bullet points, JSON, or markdown. Plain prose only.
If no strong signals are present, write: "No strong hidden preferences identified yet." """


async def run_extractor(user_id: str) -> None:
    """
    Entry point called as an asyncio background task from chat.py.
    Fetches last 20 messages, calls DeepSeek, updates profiles.inferred_preferences.
    """
    supabase = get_supabase()
    api_key = os.getenv("DEEPSEEK_API_KEY")

    if not api_key:
        print("[extractor] DEEPSEEK_API_KEY not set, skipping.")
        return

    # Fetch last 20 messages (most recent first, then reverse for chronological order)
    try:
        resp = (
            supabase.table('chat_logs')
            .select('role, content')
            .eq('user_id', user_id)
            .order('created_at', desc=True)
            .limit(20)
            .execute()
        )
        messages_raw = list(reversed(resp.data or []))
    except Exception as e:
        print(f"[extractor] Failed to fetch chat_logs: {e}")
        return

    if not messages_raw:
        print(f"[extractor] No messages found for user {user_id}")
        return

    # Format conversation as text for the prompt
    conversation_text = "\n".join(
        f"{row['role'].capitalize()}: {row['content']}"
        for row in messages_raw
    )

    # Call DeepSeek
    try:
        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com",
        )
        response = await client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": EXTRACTOR_SYSTEM_PROMPT},
                {"role": "user", "content": f"Conversation:\n{conversation_text}"},
            ],
            max_tokens=300,
            temperature=0.3,
        )
        inferred = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[extractor] DeepSeek API call failed: {e}")
        return

    # Write to profiles.inferred_preferences
    try:
        supabase.table('profiles').update({
            'inferred_preferences': inferred
        }).eq('user_id', user_id).execute()
        print(f"[extractor] Updated inferred_preferences for user {user_id}")
    except Exception as e:
        print(f"[extractor] Failed to write inferred_preferences: {e}")
