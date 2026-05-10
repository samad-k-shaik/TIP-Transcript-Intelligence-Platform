from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class SchemaType(str, Enum):
    TRANSCRIPT = "transcript"
    METADATA = "metadata"
    SPEAKER_MAPPING = "speaker_mapping"
    SUMMARY = "summary"
    EVENTS = "events"
    UNKNOWN = "unknown"

class FileDiscovery(BaseModel):
    """Metadata for a discovered file."""
    folder_path: str
    file_name: str
    detected_type: SchemaType
    status: str
    confidence_score: float = 1.0

class IngestionStatus(BaseModel):
    """Overall ingestion pipeline status."""
    total_files: int = 0
    processed_files: int = 0
    errors: int = 0
    is_running: bool = False
    last_run: Optional[str] = None
