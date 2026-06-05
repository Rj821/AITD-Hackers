from pathlib import Path

from pydantic import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./memoria.db"
    hindsight_base_url: str | None = None
    hindsight_api_key: str | None = None
    hindsight_namespace: str | None = None
    hindsight_vector_ingest_path: str = "/vector-ingest"
    hindsight_vector_search_path: str = "/vector-search"
    hindsight_fallback_ingest_path: str = "/ingest"
    hindsight_fallback_search_path: str = "/search"

    class Config:
        env_file = Path(__file__).parent.parent / ".env"


settings = Settings()
