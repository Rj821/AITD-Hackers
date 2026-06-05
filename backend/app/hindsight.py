import logging
from typing import Any

import requests

from app.config import settings
from app.schemas import MemoryItem

LOG = logging.getLogger("hindsight")


def _headers() -> dict[str, str]:
    headers = {
        "Content-Type": "application/json",
    }
    if settings.hindsight_api_key:
        headers["Authorization"] = f"Bearer {settings.hindsight_api_key}"
    return headers


def _make_url(path: str) -> str:
    return f"{settings.hindsight_base_url.rstrip('/')}/{path.lstrip('/')}"


def _push_to_url(url: str, payload: dict[str, Any]) -> bool:
    try:
        response = requests.post(url, json=payload, headers=_headers(), timeout=12)
        response.raise_for_status()
        return True
    except Exception as exc:
        LOG.warning("Failed to push memory to Hindsight at %s: %s", url, exc)
        return False


def push_memory_to_hindsight(memory: MemoryItem) -> bool:
    if not settings.hindsight_base_url:
        LOG.debug("No Hindsight base URL configured, skipping push.")
        return False

    payload = {
        "title": memory.title,
        "category": memory.category,
        "source": memory.source,
        "content": memory.content,
        "tags": memory.tags,
        "created_at": memory.created_at.isoformat() if memory.created_at else None,
    }

    primary_url = _make_url(settings.hindsight_vector_ingest_path)
    if _push_to_url(primary_url, payload):
        return True

    fallback_url = _make_url(settings.hindsight_fallback_ingest_path)
    return _push_to_url(fallback_url, payload)


def search_hindsight(question: str, top_k: int = 5) -> list[MemoryItem]:
    if not settings.hindsight_base_url:
        return []

    payload = {
        "query": question,
        "top_k": top_k,
        "namespace": settings.hindsight_namespace,
    }

    primary_url = _make_url(settings.hindsight_vector_search_path)
    try:
        response = requests.post(primary_url, json=payload, headers=_headers(), timeout=12)
        if response.status_code == 404:
            raise requests.HTTPError("Vector search endpoint not found")
        response.raise_for_status()
    except Exception as exc:
        LOG.debug("Vector search failed, falling back to keyword search: %s", exc)
        try:
            fallback_url = _make_url(settings.hindsight_fallback_search_path)
            response = requests.post(fallback_url, json=payload, headers=_headers(), timeout=12)
            response.raise_for_status()
        except Exception as exc2:
            LOG.warning("Hindsight search failed on fallback: %s", exc2)
            return []

    raw_results = response.json().get("results", [])
    memories: list[MemoryItem] = []
    for item in raw_results:
        memories.append(MemoryItem(
            id=item.get("id"),
            title=item.get("title", "Untitled"),
            category=item.get("category", "general"),
            source=item.get("source", "Hindsight"),
            content=item.get("content", ""),
            created_at=item.get("created_at"),
            tags=item.get("tags", []),
        ))
    return memories
