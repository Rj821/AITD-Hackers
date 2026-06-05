from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class MemoryCategory(str, Enum):
    incident = "incident"
    decision = "decision"
    meeting = "meeting"
    feedback = "feedback"
    documentation = "documentation"
    general = "general"


class MemoryItem(BaseModel):
    id: int | None = None
    title: str
    category: MemoryCategory = MemoryCategory.general
    source: str
    content: str
    created_at: datetime | None = None
    tags: list[str] = []

    class Config:
        orm_mode = True


class GraphNode(BaseModel):
    id: str
    label: str
    description: str
    category: MemoryCategory
    source: str


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str


class IngestResponse(BaseModel):
    stored: int
    message: str


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str
    matches: list[MemoryItem]


class TimelineEntry(BaseModel):
    month: str
    events: list[str]


class Insight(BaseModel):
    metric: str
    value: str
    details: str


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
