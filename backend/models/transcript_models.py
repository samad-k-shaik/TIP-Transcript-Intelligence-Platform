from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class TranscriptUtterance(BaseModel):
    """Normalized utterance structure."""
    call_id: str
    call_type: Optional[str] = "unknown"
    timestamp: float
    speaker_id: Optional[str] = None
    speaker_name: Optional[str] = "Unknown Speaker"
    utterance: str
    sentiment_score: Optional[float] = None
    source_file: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class CallMetadata(BaseModel):
    """Normalized call metadata."""
    call_id: str
    title: Optional[str] = None
    organizer: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[float] = None
    participants: list[str] = Field(default_factory=list)
