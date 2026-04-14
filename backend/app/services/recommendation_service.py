"""
Recommendation Service
Uses dedicated Bailian recommendation agent + halls table lookup.
"""
import json
import re
from datetime import datetime, timezone
from typing import Optional

from app.services.bailian_service import get_recommend_bailian_service
from app.database.supabase_client import get_supabase, db_exec

RECOMMEND_SYSTEM_PROMPT = """You are a HKUST dormitory recommendation engine.
Given a student's explicit form preferences and inferred hidden preferences (may be empty),
output ONLY a valid JSON array of exactly 3 objects. No explanation, no markdown, no prose.
Format strictly:
[
  {"hall_id": "<string>", "reason": "<one sentence in English>"},
  {"hall_id": "<string>", "reason": "<one sentence in English>"},
  {"hall_id": "<string>", "reason": "<one sentence in English>"}
]
Valid hall_id values are string identifiers for HKUST student halls (e.g. "1", "2", ..., "9", "JCH").
Do not include any text before or after the JSON array."""
## system prompt has been added to bailian services 

class RecommendationService:

    def __init__(self):
        self.bailian = get_recommend_bailian_service()
        self.supabase = get_supabase()

    async def generate_recommendations(self, user_id: str) -> dict:
        """
        Full recommendation flow:
        1. Fetch profile (form_preferences, inferred_preferences)
        2. Call recommendation Bailian agent -> structured JSON [{"hall_id", "reason"}]
        3. Lookup halls table for static_info of each hall_id
        4. Persist result to profiles.last_recommendation
        5. Return enriched recommendation list
        """
        try:
            profile_resp = await db_exec(lambda: (
                self.supabase.table('profiles')
                .select('form_preferences, inferred_preferences')
                .eq('user_id', user_id)
                .single()
                .execute()
            ))
            profile = profile_resp.data or {}
        except Exception as e:
            raise RuntimeError(f"Failed to fetch profile: {e}")

        form_prefs = profile.get('form_preferences') or {}
        inferred = profile.get('inferred_preferences') or "(none yet)"

        # Step 2: build prompt and call Bailian
        user_prompt = (
            f"Form Preferences: {json.dumps(form_prefs, ensure_ascii=False)}\n"
            f"Inferred Hidden Preferences: {inferred}"
        )
        messages = [
            {"role": "user", "content": user_prompt}
        ]

        raw_response = await self.bailian.send_message(messages)

        # Step 3: parse JSON array from response
        ranked = self._parse_hall_json(raw_response)
        if not ranked:
            raise RuntimeError(f"Recommendation agent returned unparseable output: {raw_response[:300]}")

        hall_ids = [str(item["hall_id"]) for item in ranked]
        halls_resp = await db_exec(lambda: (
            self.supabase.table('halls')
            .select('hall_id, name, static_info')
            .in_('hall_id', hall_ids)
            .execute()
        ))
        halls_by_id = {h['hall_id']: h for h in (halls_resp.data or [])}

        # Step 5: enrich
        four_keys = ('new_local', 'continuing_local', 'new_non_local', 'continuing_non_local')

        enriched = []
        for item in ranked:
            hall = halls_by_id.get(str(item['hall_id']), {})
            static = hall.get('static_info') or {}

            price_raw = static.get('price_info', {})
            if isinstance(price_raw, dict) and any(k in price_raw for k in four_keys):
                # New schema: pass all four price types through to frontend / consumers
                price_info = {k: price_raw.get(k, '') for k in four_keys if price_raw.get(k)}
            else:
                # Legacy or other schema: pass through as-is (RAG / frontend decide how to use)
                price_info = price_raw

            enriched.append({
                "hall_id": str(item['hall_id']),
                "name": hall.get('name', f"Hall {str(item['hall_id']).upper()}"),
                "reason": item.get('reason', ''),
                "image_url": static.get('image_url'),
                "price_info": price_info,
                "facilities": static.get('facilities', []),
                "website_url": static.get('website_url'),
            })

        try:
            await db_exec(lambda: (
                self.supabase.table('profiles').update({
                    'last_recommendation': enriched,
                    'updated_at': datetime.now(timezone.utc).isoformat(),
                }).eq('user_id', user_id).execute()
            ))
        except Exception as e:
            print(f"[recommend] Failed to save last_recommendation: {e}")

        return {"recommendations": enriched}

    def _parse_hall_json(self, text: str) -> list:
        """Extract and parse JSON array from model response."""
        try:
            parsed = json.loads(text.strip())
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group())
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                pass
        return []


_recommendation_service: Optional[RecommendationService] = None


def get_recommendation_service() -> RecommendationService:
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
    return _recommendation_service
