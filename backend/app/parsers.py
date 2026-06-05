from io import BytesIO
from typing import Any

from docx import Document
from pypdf import PdfReader


def parse_pdf(raw_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(raw_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n\n".join(pages).strip()


def parse_docx(raw_bytes: bytes) -> str:
    document = Document(BytesIO(raw_bytes))
    paragraphs = [paragraph.text for paragraph in document.paragraphs]
    return "\n\n".join(paragraphs).strip()


def parse_upload_file(raw_bytes: bytes, filename: str, content_type: str | None = None) -> str:
    normalized_name = filename.lower()
    if normalized_name.endswith(".pdf") or content_type == "application/pdf":
        return parse_pdf(raw_bytes)
    if normalized_name.endswith(".docx") or content_type in {"application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"}:
        return parse_docx(raw_bytes)
    return raw_bytes.decode("utf-8", errors="ignore").strip()
