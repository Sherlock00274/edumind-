from __future__ import annotations

import json
import re
from typing import Any

import httpx

from app.core.config import settings


class AiGatewayError(RuntimeError):
    pass


class AiGatewayNotConfiguredError(AiGatewayError):
    pass


def is_ai_configured() -> bool:
    return bool(settings.llm_api_key and settings.llm_api_key.strip())


def generate_json(
    prompt: str,
    schema: dict[str, Any],
    *,
    system_prompt: str | None = None,
    temperature: float = 0.2,
    api_key: str | None = None,
) -> Any:
    resolved_api_key = (api_key or settings.llm_api_key or "").strip()
    if not resolved_api_key:
        raise AiGatewayNotConfiguredError("LLM_API_KEY is not configured.")

    endpoint = settings.llm_api_url.rstrip("/") + "/chat/completions"
    request_payload = {
        "model": settings.llm_model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
                or (
                    "You are a strict JSON generator. Return only valid JSON that "
                    "conforms to the user's schema. Do not include Markdown fences."
                ),
            },
            {
                "role": "user",
                "content": (
                    "JSON schema:\n"
                    f"{json.dumps(schema, ensure_ascii=False)}\n\n"
                    "Task:\n"
                    f"{prompt}"
                ),
            },
        ],
        "temperature": temperature,
        "response_format": {"type": "json_object"},
    }
    try:
        response = _post_chat_completion(endpoint, request_payload, resolved_api_key)
    except httpx.HTTPError as exc:
        raise AiGatewayError(f"LLM request failed: {exc}") from exc

    if response.status_code == 400 and "response_format" in response.text:
        request_payload.pop("response_format", None)
        try:
            response = _post_chat_completion(endpoint, request_payload, resolved_api_key)
        except httpx.HTTPError as exc:
            raise AiGatewayError(f"LLM request failed: {exc}") from exc

    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise AiGatewayError(f"LLM request failed: {exc.response.text}") from exc

    payload = response.json()
    try:
        content = payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise AiGatewayError("LLM response did not include choices[0].message.content.") from exc

    return parse_json_content(content)


def _post_chat_completion(endpoint: str, payload: dict[str, Any], api_key: str) -> httpx.Response:
    return httpx.post(
        endpoint,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=settings.llm_timeout_seconds,
    )


def parse_json_content(content: str) -> Any:
    stripped = content.strip()
    fenced = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", stripped, flags=re.DOTALL)
    if fenced:
        stripped = fenced.group(1).strip()

    try:
        return json.loads(stripped)
    except json.JSONDecodeError as exc:
        raise AiGatewayError("LLM response was not valid JSON.") from exc
