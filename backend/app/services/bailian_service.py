"""
Alibaba Cloud Bailian (Model Studio) Service
Supports dual agents, manual history (messages array), memory_id, and SSE streaming.
"""
import httpx
import json
import os
from typing import Optional, List, Dict, Any, AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

BAILIAN_BASE = "https://dashscope.aliyuncs.com/api/v1"


class BailianService:
    """
    Bailian Agent API client.
    Instantiate separately for chat agent and recommendation agent.
    """

    def __init__(self, app_id: str):
        self.api_key = os.getenv("BAILIAN_API_KEY")
        self.app_id = app_id
        self.completion_url = f"{BAILIAN_BASE}/apps/{self.app_id}/completion"
        if not self.api_key:
            raise ValueError("BAILIAN_API_KEY must be set")
        if not self.app_id:
            raise ValueError("app_id must be provided")

    def _base_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _build_payload(
        self,
        messages: List[Dict[str, str]],
        memory_id: Optional[str] = None,
        incremental: bool = False,
    ) -> Dict[str, Any]:
        """
        Build request payload using manual messages array.
        messages format: [{"role": "user"|"assistant", "content": "..."}]
        If memory_id is provided, include it in input for long-term memory recall.
        """
        input_block: Dict[str, Any] = {"messages": messages}
        if memory_id:
            input_block["memory_id"] = memory_id

        return {
            "input": input_block,
            "parameters": {"incremental_output": incremental},
            "debug": {},
        }

    async def send_message(
        self,
        messages: List[Dict[str, str]],
        memory_id: Optional[str] = None,
    ) -> str:
        """
        Non-streaming call. Used for recommendation agent.
        Returns the full response text.
        """
        payload = self._build_payload(messages, memory_id, incremental=False)
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(
                    self.completion_url,
                    headers=self._base_headers(),
                    json=payload,
                )
                if response.status_code != 200:
                    err = response.text
                    raise RuntimeError(f"Bailian API error {response.status_code}: {err}")
                data = response.json()
                return data.get("output", {}).get("text", "")
        except httpx.TimeoutException:
            raise RuntimeError("Bailian request timed out")

    async def stream_message(
        self,
        messages: List[Dict[str, str]],
        memory_id: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        SSE streaming call. Used for chat agent.
        Yields incremental text chunks as they arrive.
        Raises RuntimeError on API failure.

        Usage:
            async for chunk in service.stream_message(messages, memory_id):
                yield f"data: {json.dumps({'text': chunk})}\\n\\n"
        """
        payload = self._build_payload(messages, memory_id, incremental=True)
        headers = {**self._base_headers(), "X-DashScope-SSE": "enable"}

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST", self.completion_url, headers=headers, json=payload
            ) as response:
                if response.status_code != 200:
                    body = await response.aread()
                    raise RuntimeError(
                        f"Bailian stream error {response.status_code}: {body.decode()}"
                    )
                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        raw = line[5:].strip()
                        if not raw:
                            continue
                        try:
                            data = json.loads(raw)
                            text = data.get("output", {}).get("text", "")
                            finish = data.get("output", {}).get("finish_reason", "null")
                            if text:
                                yield text
                            if finish == "stop":
                                return
                        except json.JSONDecodeError:
                            continue

    async def create_memory(self) -> str:
        """
        Call Bailian CreateMemory API to create a new long-term memory body.
        Returns the memory_id string.
        Prerequisite: The agent app must have 'Long-term Memory' enabled in Bailian console.
        Bailian docs: POST https://dashscope.aliyuncs.com/api/v1/memories
        """
        url = f"{BAILIAN_BASE}/memories"
        payload = {"app_id": self.app_id}
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    headers=self._base_headers(),
                    json=payload,
                )
                if response.status_code != 200:
                    raise RuntimeError(
                        f"CreateMemory failed {response.status_code}: {response.text}"
                    )
                data = response.json()
                memory_id = data.get("memory_id") or data.get("data", {}).get("memory_id")
                if not memory_id:
                    raise RuntimeError(f"No memory_id in CreateMemory response: {data}")
                return memory_id
        except httpx.TimeoutException:
            raise RuntimeError("CreateMemory request timed out")


# ---- Module-level singletons ----

_chat_service: Optional[BailianService] = None
_recommend_service: Optional[BailianService] = None


def get_chat_bailian_service() -> BailianService:
    global _chat_service
    if _chat_service is None:
        app_id = os.getenv("BAILIAN_APP_ID_CHAT", "")
        _chat_service = BailianService(app_id)
    return _chat_service


def get_recommend_bailian_service() -> BailianService:
    global _recommend_service
    if _recommend_service is None:
        app_id = os.getenv("BAILIAN_APP_ID_RECOMMEND", "")
        _recommend_service = BailianService(app_id)
    return _recommend_service
