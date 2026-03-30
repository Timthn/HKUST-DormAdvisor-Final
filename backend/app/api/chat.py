"""
Chat API Endpoints
Handles chat interactions with AI advisor
"""
import asyncio
import json
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatMessage, ChatResponse
from app.middleware.auth import get_current_user_id
from app.services.bailian_service import get_chat_bailian_service
from app.services.extractor_service import run_extractor
from app.database.supabase_client import get_supabase, get_dev_storage

router = APIRouter()


def _fetch_profile(supabase, user_id: str) -> dict:
    if supabase:
        try:
            resp = supabase.table('profiles').select('*').eq('user_id', user_id).single().execute()
            if resp.data:
                return resp.data
        except Exception:
            pass
    return {
        'identity': 'Undergraduate (Dev)',
        'budget_range': 'HK$ 15000 - 20000',
        'preferences': {'room_types': ['Single Room'], 'priorities': ['Price']},
    }


def _build_context_prompt(profile: dict, user_message: str) -> str:
    fp = profile.get('form_preferences') or {}
    identity = fp.get('identity') or profile.get('identity', 'Student')
    budget = fp.get('budget_range') or profile.get('budget_range', 'Not specified')
    preferences = fp.get('priorities') or profile.get('preferences', {})
    inferred = profile.get('inferred_preferences') or ''

    context_lines = [
        "[User Context]",
        f"- Identity: {identity}",
        f"- Budget: {budget}",
        f"- Preferences: {preferences}",
    ]
    if isinstance(inferred, str) and inferred.strip():
        context_lines.append(f"- Inferred Preferences: {inferred}")

    context = "\n".join(context_lines)
    return f"{context}\n\n[User Question]\n{user_message}"


def _strip_footnote_references(text: str) -> str:
    """Remove Bailian-style footnote refs: [^0], [^1], ... and definition lines [^n]: [title](url)."""
    if not text or not text.strip():
        return text
    # Remove footnote definition lines (e.g. [^0]: [香港科技大学...](https://...))
    text = re.sub(r"\n?\s*\[\^[0-9]+\]:\s*[^\n]*(?=\n|$)", "", text)
    # Remove inline markers [^0], [^1], etc.
    text = re.sub(r"\[\^[0-9]+\]", "", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def _get_recent_chat_messages(supabase, user_id: str, limit: int = 10) -> list:
    """Fetch recent chat_logs for user (chronological order) for multi-turn context. Returns list of {role, content}."""
    if not supabase:
        return []
    try:
        rows = (
            supabase.table("chat_logs")
            .select("id, created_at, role, content")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        if not rows.data:
            return []
        # Query gets newest rows first; sort back to chronological order for model context.
        # Same-turn rows share created_at; sort by id so user (inserted first) comes before assistant.
        ordered = sorted(rows.data, key=lambda r: (r.get("created_at") or "", r.get("id") or 0))
        return [{"role": r["role"], "content": (r.get("content") or "").strip()} for r in ordered]
    except Exception:
        return []


def _maybe_schedule_extractor(supabase, user_id: str) -> None:
    """
    Trigger DeepSeek extractor as a background task every 5 completed turns
    (user question + assistant answer) for the given user.
    We approximate turn count by the number of assistant messages.
    """
    if not supabase:
        return
    try:
        resp = (
            supabase.table("chat_logs")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("role", "assistant")
            .execute()
        )
        total_assistant_msgs = getattr(resp, "count", None)
        if not isinstance(total_assistant_msgs, int):
            return
        if total_assistant_msgs % 5 == 0 and total_assistant_msgs > 0:
            asyncio.create_task(run_extractor(user_id))
    except Exception as e:
        print(f"[extractor-trigger] Failed to schedule extractor: {e}")


@router.post("/stream")
async def stream_chat_message(
    message: ChatMessage,
    user_id: str = Depends(get_current_user_id),
):
    """Stream chat via SSE. Uses recent chat_logs for multi-turn context, then writes user + assistant (two INSERTs)."""
    supabase = get_supabase()
    bailian = get_chat_bailian_service()
    profile = _fetch_profile(supabase, user_id)

    # Long‑term memory: for now, only use existing memory_id if already present.
    # We no longer attempt to create a new memory_id here to avoid API errors.
    memory_id = profile.get("memory_id")

    context_prompt = _build_context_prompt(profile, message.message)

    # Multi-turn: fetch chat_logs → history (list of {role, content}) → append new user query → send to Bailian
    history = _get_recent_chat_messages(supabase, user_id, limit=10)
    msgs = history + [{"role": "user", "content": context_prompt}]
    print(f"[stream] Sending to Bailian: {len(history)} history + 1 current = {len(msgs)} messages")

    turn_ts = datetime.now(timezone.utc).isoformat()

    if supabase:
        try:
            supabase.table('chat_logs').insert({
                'user_id': user_id, 'role': 'user', 'content': message.message, 'created_at': turn_ts,
                'history_sent': msgs,
                'profile_sent': profile.get('form_preferences'),
                'inferred_preferences_sent': profile.get('inferred_preferences'),
            }).execute()
        except Exception as e:
            print(f"[stream] Failed to save user message: {e}")

    async def event_stream():
        full_text = ""
        try:
            async for chunk in bailian.stream_message(msgs, memory_id=memory_id):
                full_text += chunk
                yield f"data: {json.dumps({'text': chunk})}\n\n"
                await asyncio.sleep(0)
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return
        finally:
            if supabase and full_text:
                try:
                    clean_text = _strip_footnote_references(full_text)
                    chunk_returned = getattr(bailian, "_last_doc_references", None)
                    supabase.table('chat_logs').insert({
                        'user_id': user_id, 'role': 'assistant', 'content': clean_text, 'created_at': turn_ts,
                        'chunk_returned': chunk_returned,
                    }).execute()
                    _maybe_schedule_extractor(supabase, user_id)
                except Exception as e:
                    print(f"[stream] Failed to save assistant response: {e}")

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@router.post("/", response_model=ChatResponse)
async def send_chat_message(
    message: ChatMessage,
    user_id: str = Depends(get_current_user_id)
):
    """Non-streaming chat. Uses same multi-turn history as /stream."""
    supabase = get_supabase()
    bailian = get_chat_bailian_service()

    try:
        profile = _fetch_profile(supabase, user_id)

        # Long‑term memory: only use an existing memory_id if profile already has one.
        # We intentionally no longer create a new memory_id here.
        memory_id = profile.get("memory_id")

        context_prompt = _build_context_prompt(profile, message.message)
        history = _get_recent_chat_messages(supabase, user_id, limit=10)
        messages = history + [{"role": "user", "content": context_prompt}]

        ai_response_text, doc_references = await bailian.send_message(messages, memory_id=memory_id)
        ai_response = _strip_footnote_references(ai_response_text)

        # Step 5: Store chat logs
        if supabase:
            timestamp = datetime.now().isoformat()
            supabase.table('chat_logs').insert({
                'user_id': user_id, 'role': 'user', 'content': message.message, 'created_at': timestamp,
                'history_sent': messages,
                'profile_sent': profile.get('form_preferences'),
                'inferred_preferences_sent': profile.get('inferred_preferences'),
            }).execute()
            supabase.table('chat_logs').insert({
                'user_id': user_id, 'role': 'assistant', 'content': ai_response, 'created_at': timestamp,
                'chunk_returned': doc_references,
            }).execute()
            _maybe_schedule_extractor(supabase, user_id)
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
    Get user's chat history: the latest `limit` rows, then ordered oldest→newest for UI.
    """
    supabase = get_supabase()
    
    try:
        response = (
            supabase.table('chat_logs')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', desc=True)
            .limit(limit)
            .execute()
        )
        # Newest-first query → sort back to chronological for scrolling top→bottom.
        # Same-turn rows share created_at; id orders user before assistant.
        messages = sorted(response.data or [], key=lambda r: (r.get('created_at') or '', r.get('id') or 0))
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {str(e)}")
