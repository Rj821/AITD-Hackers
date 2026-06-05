from collections import Counter
from datetime import datetime
from typing import Any

from sqlmodel import Field, Session, SQLModel, create_engine, select

from app.config import settings
from app.hindsight import push_memory_to_hindsight, search_hindsight
from app.schemas import MemoryCategory, MemoryItem


def _get_engine():
    engine = create_engine(settings.database_url, echo=False)
    return engine


class MemoryRecord(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    category: MemoryCategory
    source: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    tags: str = ""


def init_db() -> None:
    engine = _get_engine()
    SQLModel.metadata.create_all(engine)


def _build_memory_item(record: MemoryRecord) -> MemoryItem:
    return MemoryItem(
        id=record.id,
        title=record.title,
        category=record.category,
        source=record.source,
        content=record.content,
        created_at=record.created_at,
        tags=(record.tags.split(",") if record.tags else []),
    )


def ingest_text(
    source: str,
    title: str,
    content: str,
    category: MemoryCategory = MemoryCategory.general,
    tags: list[str] | None = None,
) -> MemoryItem:
    record = MemoryRecord(
        title=title,
        category=category,
        source=source,
        content=content,
        tags=",".join([tag.strip() for tag in (tags or []) if tag.strip()]),
    )
    engine = _get_engine()
    with Session(engine) as session:
        session.add(record)
        session.commit()
        session.refresh(record)

    memory = _build_memory_item(record)
    push_memory_to_hindsight(memory)
    return memory


def search_memories(query: str, limit: int = 5) -> list[MemoryItem]:
    engine = _get_engine()
    with Session(engine) as session:
        statement = select(MemoryRecord)
        results = session.exec(statement).all()

    query_lower = query.lower()
    matched = []
    for record in results:
        score = 0
        if query_lower in record.title.lower():
            score += 4
        if query_lower in record.content.lower():
            score += 3
        if query_lower in record.source.lower():
            score += 1
        if query_lower in record.tags.lower():
            score += 1
        if score > 0:
            matched.append((score, record))

    matched.sort(key=lambda item: item[0], reverse=True)
    local_matches = [_build_memory_item(record) for _, record in matched[:limit]]
    remote_matches = search_hindsight(query, top_k=limit)

    if remote_matches:
        combined = {f"{memory.title}:{memory.source}": memory for memory in local_matches}
        for remote in remote_matches:
            key = f"{remote.title}:{remote.source}"
            combined.setdefault(key, remote)
        return list(combined.values())[:limit]

    return local_matches


def build_answer(question: str, matches: list[MemoryItem]) -> str:
    if not matches:
        return "No matching organizational memory was found. Add meeting notes, incident reports, or decision summaries to build memory."

    summary_lines = [f"Based on historical memory for '{question}':"]
    for memory in matches:
        summary_lines.append(
            f"- {memory.title} ({memory.category}) from {memory.source}: {memory.content[:220].strip()}..."
        )
    summary_lines.append("\nUse these memorized insights to avoid repeating past issues and to review earlier decisions.")
    return "\n".join(summary_lines)


def build_timeline() -> list[dict[str, Any]]:
    engine = _get_engine()
    with Session(engine) as session:
        statement = select(MemoryRecord)
        results = session.exec(statement).all()

    events_by_month: dict[str, list[str]] = {}
    for record in results:
        key = record.created_at.strftime("%B %Y")
        events_by_month.setdefault(key, []).append(record.title)

    return [{"month": month, "events": events} for month, events in sorted(events_by_month.items())]


def build_insights() -> list[dict[str, str]]:
    engine = _get_engine()
    with Session(engine) as session:
        statement = select(MemoryRecord)
        results = session.exec(statement).all()

    categories = [record.category.value for record in results]
    counter = Counter(categories)
    total = len(results)
    top_categories = counter.most_common(3)

    insights = []
    if total:
        for category, count in top_categories:
            percent = round((count / total) * 100)
            insights.append({
                "metric": f"{category.title()} records",
                "value": f"{count} ({percent}%)",
                "details": f"{percent}% of stored memories are {category}.",
            })
        insights.append({
            "metric": "Total memory items",
            "value": str(total),
            "details": "This memory store powers contextual retrieval and incident analysis.",
        })
    else:
        insights.append({
            "metric": "No memories yet",
            "value": "0",
            "details": "Upload documents or notes to begin building organizational memory.",
        })

    return insights


def build_graph() -> dict[str, Any]:
    engine = _get_engine()
    with Session(engine) as session:
        statement = select(MemoryRecord)
        results = session.exec(statement).all()

    nodes = []
    for record in results:
        nodes.append(
            {
                "id": f"item-{record.id}",
                "label": record.title,
                "description": record.content[:120].strip() + ("..." if len(record.content) > 120 else ""),
                "category": record.category.value,
                "source": record.source,
            }
        )

    edges = []
    seen = set()
    for i, left in enumerate(results):
        left_tags = set(tag.strip().lower() for tag in (left.tags or "").split(",") if tag.strip())
        for right in results[i + 1 :]:
            right_tags = set(tag.strip().lower() for tag in (right.tags or "").split(",") if tag.strip())
            if left.source == right.source or left.category == right.category or left_tags & right_tags:
                edge_key = (left.id, right.id)
                if edge_key in seen:
                    continue
                seen.add(edge_key)
                label = "shared source"
                if left.source != right.source:
                    label = "same category" if left.category == right.category else "shared tag"
                edges.append(
                    {
                        "id": f"edge-{left.id}-{right.id}",
                        "source": f"item-{left.id}",
                        "target": f"item-{right.id}",
                        "label": label,
                    }
                )

    return {"nodes": nodes, "edges": edges}
