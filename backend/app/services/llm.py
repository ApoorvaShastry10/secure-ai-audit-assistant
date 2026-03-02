from typing import Any, Dict, List
import re
import httpx
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from app.core.config import settings
from app.core.exceptions import AppError

class LLMProvider:
    async def answer(self, *, question: str, context_chunks: List[Dict[str, Any]]) -> str:
        raise NotImplementedError

class MockLLMProvider(LLMProvider):
    async def answer(self, *, question: str, context_chunks: List[Dict[str, Any]]) -> str:
        q = question.lower()
        picks=[]
        for ch in context_chunks:
            for s in re.split(r"(?<=[.!?])\s+", ch['content']):
                if any(tok in s.lower() for tok in q.split()[:6]):
                    picks.append((s.strip(), ch['citation']))
        if not picks:
            for ch in context_chunks[:2]:
                s = re.split(r"(?<=[.!?])\s+", ch['content'].strip())[0].strip()
                if s: picks.append((s, ch['citation']))
        seen=set(); out=[]
        for s,c in picks:
            if s and s not in seen:
                seen.add(s); out.append(f"- {s} [{c}]")
            if len(out)>=5: break
        return "Grounded answer (mock mode):\n" + ("\n".join(out) if out else "I don't have enough authorized context to answer that.")

class OpenAICompatibleLLMProvider(LLMProvider):
    async def answer(self, *, question: str, context_chunks: List[Dict[str, Any]]) -> str:
        url = settings.openai_base_url.rstrip('/') + '/chat/completions'
        headers = {'Authorization': f'Bearer {settings.openai_api_key}'}
        context = "\n\n".join(f"[{ch['citation']}]\n{ch['content']}" for ch in context_chunks)
        body = {
            "model": settings.openai_chat_model,
            "messages": [
                {"role":"system","content":"Answer ONLY from provided context. Cite like [DOC:<doc_id>#<chunk_index>]."},
                {"role":"user","content": f"Question: {question}\n\nContext:\n{context}"}
            ],
            "temperature": 0.2
        }
        try:
            async with httpx.AsyncClient(timeout=settings.llm_request_timeout_seconds) as client:
                r = await client.post(url, headers=headers, json=body)
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
        except Exception:
            raise AppError("LLM provider unavailable", status_code=HTTP_503_SERVICE_UNAVAILABLE, code="LLM_UNAVAILABLE")

def get_llm_provider() -> LLMProvider:
    return MockLLMProvider() if settings.mock_mode else OpenAICompatibleLLMProvider()
