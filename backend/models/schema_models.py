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

class PipelineStage(str, Enum):
    IDLE = "idle"
    DISCOVERY = "discovery"
    CLASSIFICATION = "classification"
    HARMONIZATION = "harmonization"
    RESOLVING = "resolving"
    AI_ENRICHMENT = "ai_enrichment"
    FINALIZING = "finalizing"
    COMPLETE = "complete"

class FileDiscovery(BaseModel):
    """Metadata for a discovered file."""
    folder_path: str
    file_name: str
    detected_type: SchemaType
    status: str
    confidence_score: float = 1.0

class FileOutcome(BaseModel):
    """Result of processing a specific file."""
    file_name: str
    call_id: str
    type: SchemaType
    status: str  # "processed", "skipped", "error"
    error_message: Optional[str] = None

class IngestionStatus(BaseModel):
    """Overall ingestion pipeline status."""
    total_files: int = 0
    processed_files: int = 0
    ai_analyzed: int = 0
    errors: int = 0
    is_running: bool = False
    current_stage: PipelineStage = PipelineStage.IDLE
    stage_progress: float = 0.0
    status_message: str = ""
    last_run: Optional[str] = None
    outcomes: List[FileOutcome] = []

class IngestRequest(BaseModel):
    """Request to trigger ingestion for a specific dataset."""
    dataset: Optional[str] = None
