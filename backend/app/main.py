from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.config import settings
from app.parsers import parse_upload_file
from app.schemas import GraphResponse, IngestResponse, MemoryCategory, QueryRequest, QueryResponse, TimelineEntry, Insight
from app.services import build_answer, build_graph, build_insights, build_timeline, init_db, ingest_text, search_memories

app = FastAPI(
    title="Memoria AI Backend",
    description="Organizational memory API for Memoria AI.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_db()


@app.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    source: str = Form(...),
    title: str = Form(...),
    category: str = Form("general"),
    tags: str = Form(""),
    file: UploadFile | None = File(None),
    text: str | None = Form(None),
):
    content = ""
    if file is not None:
        raw = await file.read()
        content = parse_upload_file(raw, file.filename, file.content_type)
    elif text:
        content = text.strip()
    else:
        raise HTTPException(status_code=400, detail="Either file or text content must be provided.")

    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file or text content was empty.")

    try:
        category_enum = MemoryCategory(category)
    except ValueError:
        category_enum = MemoryCategory.general

    memory = ingest_text(
        source=source,
        title=title,
        content=content,
        category=category_enum,
        tags=[tag.strip() for tag in tags.split(",") if tag.strip()],
    )
    return IngestResponse(stored=1, message=f"Stored memory item {memory.title}")


@app.post("/query", response_model=QueryResponse)
def query_memory(request: QueryRequest):
    matches = search_memories(request.question)
    answer = build_answer(request.question, matches)
    return QueryResponse(answer=answer, matches=matches)


@app.get("/timeline", response_model=List[TimelineEntry])
def timeline():
    timeline_data = build_timeline()
    return [TimelineEntry(month=item["month"], events=item["events"]) for item in timeline_data]


@app.get("/insights", response_model=List[Insight])
def insights():
    return [Insight(**insight) for insight in build_insights()]


@app.get("/graph", response_model=GraphResponse)
def graph():
    return GraphResponse(**build_graph())
