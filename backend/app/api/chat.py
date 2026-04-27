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
                data = resp.data
                fp = data.get('form_preferences') or {}
                # Backward-compatible normalization so prompt builder can rely on both
                # new form_preferences fields and legacy flat/profile keys.
                data.setdefault('identity', fp.get('identity'))
                data.setdefault('gender', fp.get('gender'))
                data.setdefault('budget_range', fp.get('budget_range'))
                data.setdefault('room_types', fp.get('room_types') or [])
                data.setdefault('priorities', fp.get('priorities') or [])
                data.setdefault('additional_info', fp.get('additional_info'))
                return data
        except Exception:
            pass
    fallback_fp = {
        'identity': 'Undergraduate (Dev)',
        'gender': None,
        'budget_range': 'HK$ 15000 - 20000',
        'room_types': ['Single Room'],
        'priorities': ['Price'],
        'additional_info': None,
    }
    return {
        'identity': fallback_fp['identity'],
        'gender': fallback_fp['gender'],
        'budget_range': fallback_fp['budget_range'],
        'room_types': fallback_fp['room_types'],
        'priorities': fallback_fp['priorities'],
        # Keep legacy fallback shape to avoid any implicit dependency breakage.
        'preferences': {'room_types': fallback_fp['room_types'], 'priorities': fallback_fp['priorities']},
        'form_preferences': fallback_fp,
        'inferred_preferences': '',
    }


def _build_context_prompt(profile: dict, user_message: str) -> str:
    fp = profile.get('form_preferences') or {}
    identity = fp.get('identity') or profile.get('identity') or 'Student'
    gender = fp.get('gender') or profile.get('gender') or 'Not specified'
    budget = fp.get('budget_range') or profile.get('budget_range') or 'Not specified'
    room_types = fp.get('room_types') or profile.get('room_types') or profile.get('preferences', {}).get('room_types') or []
    priorities = fp.get('priorities') or profile.get('priorities') or profile.get('preferences', {}).get('priorities') or []
    additional_info = fp.get('additional_info') or profile.get('additional_info') or ''
    inferred = profile.get('inferred_preferences') or ''

    context_lines = [
        "[User Context]",
        f"- Identity: {identity}",
        f"- Gender: {gender}",
        f"- Budget: {budget}",
        f"- Room Types: {', '.join(room_types) if isinstance(room_types, list) and room_types else 'Any'}",
        f"- Priorities: {', '.join(priorities) if isinstance(priorities, list) and priorities else 'Any'}",
    ]
    if isinstance(additional_info, str) and additional_info.strip():
        context_lines.append(f"- Additional Info: {additional_info}")
    if isinstance(inferred, str) and inferred.strip():
        context_lines.append(f"- Inferred Preferences: {inferred}")

    context = "\n".join(context_lines)
    return f"{context}\n\n[User Question]\n{user_message}"


def _format_recent_history_for_prompt(
    history: list,
    max_turns: int = 3,
    max_chars_user: int = 120,
    max_chars_assistant: int = 70,
) -> str:
    """
    Build a compact turn-based recent-history section for prompt injection.
    Keeps only recent user-assistant turns to control token usage.
    """
    if not isinstance(history, list) or not history:
        return ""

    normalized_rows = []
    for row in history:
        if not isinstance(row, dict):
            continue
        role_raw = str(row.get("role") or "user").strip().lower()
        if role_raw not in ("user", "assistant"):
            continue
        content = str(row.get("content") or "").strip()
        if not content:
            continue

        # Compact noisy formatting to reduce prompt tokens while preserving intent.
        content = re.sub(r"\n?\s*\[\^[0-9]+\]:\s*[^\n]*(?=\n|$)", " ", content)
        content = re.sub(r"\[\^[0-9]+\]", "", content)
        content = re.sub(r"https?://\S+", " ", content)
        content = re.sub(r"\|[^\n]*\|", " ", content)
        content = re.sub(r"\s+", " ", content).strip()
        if not content:
            continue

        normalized_rows.append({"role": role_raw, "content": content})

    if not normalized_rows:
        return ""

    # Pair rows into turns: each user message followed by the next assistant response.
    turns = []
    i = 0
    while i < len(normalized_rows):
        row = normalized_rows[i]
        if row["role"] != "user":
            i += 1
            continue

        user_text = row["content"]
        assistant_text = ""
        j = i + 1
        while j < len(normalized_rows):
            if normalized_rows[j]["role"] == "assistant":
                assistant_text = normalized_rows[j]["content"]
                break
            if normalized_rows[j]["role"] == "user":
                break
            j += 1

        if len(user_text) > max_chars_user:
            user_text = f"{user_text[:max_chars_user].rstrip()}..."
        if assistant_text and len(assistant_text) > max_chars_assistant:
            assistant_text = f"{assistant_text[:max_chars_assistant].rstrip()}..."

        turns.append((user_text, assistant_text))
        i = max(i + 1, j + 1 if assistant_text else i + 1)

    if not turns:
        return ""

    lines = ["[Recent Conversation History]"]
    for idx, (user_text, assistant_text) in enumerate(turns[-max_turns:], 1):
        if assistant_text:
            lines.append(f"{idx}. User asked: {user_text} | Assistant replied: {assistant_text}")
        else:
            lines.append(f"{idx}. User asked: {user_text} | Assistant replied: (no reply yet)")
    return "\n".join(lines)


def _build_context_prompt_with_history(profile: dict, user_message: str, history: list | None = None) -> str:
    """Compose base user context prompt and optionally append compact recent history."""
    base_prompt = _build_context_prompt(profile, user_message)
    history_block = _format_recent_history_for_prompt(history or [])
    if not history_block:
        return base_prompt
    return f"{base_prompt}\n\n{history_block}"


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
    Trigger DeepSeek extractor as a background task every 3 completed turns
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
        if total_assistant_msgs % 3 == 0 and total_assistant_msgs > 0:
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

    # Multi-turn: fetch chat_logs → history (list of {role, content}) → append new user query → send to Bailian
    history = _get_recent_chat_messages(supabase, user_id, limit=10)
    context_prompt = _build_context_prompt_with_history(profile, message.message, history=history)
    msgs = history + [{"role": "user", "content": context_prompt}]
    history_chars = sum(len((m.get("content") or "")) for m in history if isinstance(m, dict))
    print(f"[stream] Sending to Bailian: {len(history)} history + 1 current = {len(msgs)} messages")
    print(
        f"[stream] Prompt stats: history_count={len(history)}, "
        f"history_chars={history_chars}, context_chars={len(context_prompt)}"
    )

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

        history = _get_recent_chat_messages(supabase, user_id, limit=10)
        context_prompt = _build_context_prompt_with_history(profile, message.message, history=history)
        messages = history + [{"role": "user", "content": context_prompt}]
        history_chars = sum(len((m.get("content") or "")) for m in history if isinstance(m, dict))
        print(
            f"[chat] Prompt stats: history_count={len(history)}, "
            f"history_chars={history_chars}, context_chars={len(context_prompt)}"
        )

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
