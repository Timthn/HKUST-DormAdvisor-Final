"""
Recommendation Service
Uses dedicated Bailian recommendation agent + halls table lookup.
"""
import json
import re
from datetime import datetime, timezone
from typing import Optional

from app.services.bailian_service import get_recommend_bailian_service
from app.database.supabase_client import get_supabase

RECOMMEND_SYSTEM_PROMPT = """You are a HKUST dormitory recommendation engine.
Given a student's explicit form preferences and inferred hidden preferences (may be empty),
output ONLY a valid JSON array of exactly 3 objects. No explanation, no markdown, no prose.
Format strictly:
[
  {"hall_id": "<string>", "reason": "<one sentence in English>"},
  {"hall_id": "<string>", "reason": "<one sentence in English>"},
  {"hall_id": "<string>", "reason": "<one sentence in English>"}
]
Valid hall_id values are string identifiers for HKUST student halls (e.g. "1", "2", ..., "9", "JHC").
Do not include any text before or after the JSON array."""


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
        # Step 1: fetch profile
        try:
            profile_resp = (
                self.supabase.table('profiles')
                .select('form_preferences, inferred_preferences')
                .eq('user_id', user_id)
                .single()
                .execute()
            )
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

        # Step 4: lookup halls table
        hall_ids = [str(item["hall_id"]) for item in ranked]
        halls_resp = (
            self.supabase.table('halls')
            .select('hall_id, name, static_info')
            .in_('hall_id', hall_ids)
            .execute()
        )
        halls_by_id = {h['hall_id']: h for h in (halls_resp.data or [])}

        # Step 5: enrich
        identity = form_prefs.get('identity', '')
        use_nonlocal_price = 'Non-Local' in identity or 'Exchange' in identity

        enriched = []
        for item in ranked:
            hall = halls_by_id.get(str(item['hall_id']), {})
            static = hall.get('static_info') or {}

            price_raw = static.get('price_info', {})
            if isinstance(price_raw, dict):
                price_key = 'non_local' if use_nonlocal_price else 'local'
                price_str = price_raw.get(price_key, '')
                price_note = static.get('price_note', '')
                price_info = f"{price_str} ({price_note})" if price_str and price_note else price_str
            else:
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

        # Step 6: persist to profiles.last_recommendation
        try:
            self.supabase.table('profiles').update({
                'last_recommendation': enriched,
                'updated_at': datetime.now(timezone.utc).isoformat(),
            }).eq('user_id', user_id).execute()
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
