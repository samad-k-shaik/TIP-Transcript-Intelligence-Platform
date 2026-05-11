import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime
from dateutil import parser
from ..models.transcript_models import TranscriptUtterance, CallMetadata
from ..utils.logger import logger

class Harmonizer:
    """Normalizes heterogeneous transcript structures into a unified schema."""

    def harmonize_transcript(self, raw_data: Dict[str, Any], call_id: str, source_file: str) -> List[TranscriptUtterance]:
        """Maps raw JSON data to a list of TranscriptUtterance models."""
        utterances = []
        
        # Determine where the list of utterances is (handle common drift patterns)
        items = []
        if isinstance(raw_data, list):
            items = raw_data
        elif isinstance(raw_data, dict):
            # Check for common wrapper keys
            for key in ["data", "utterances", "sentences", "transcript", "items"]:
                if key in raw_data and isinstance(raw_data[key], list):
                    items = raw_data[key]
                    break
        
        if not items:
            logger.warning(f"No utterances found in {source_file}")
            return []

        for index, item in enumerate(items):
            try:
                if not isinstance(item, dict):
                    continue

                # Handle schema drift by checking multiple potential keys for text
                text = (
                    item.get("sentence") or 
                    item.get("text") or 
                    item.get("utterance") or 
                    item.get("message", "")
                )
                if not text:
                    continue
                
                speaker_id = str(item.get("speaker_id") or item.get("spk") or item.get("user_id", ""))
                speaker_name = item.get("speaker_name") or item.get("speaker") or item.get("name", "Unknown Speaker")
                
                # Standardize timestamps using dateutil or float
                raw_ts = item.get("time") or item.get("timestamp") or item.get("start_time") or 0.0
                timestamp = self._normalize_timestamp(raw_ts)
                
                # Extract sentiment if available
                sentiment = item.get("sentiment_score") or item.get("sentiment")
                if isinstance(sentiment, str):
                    sentiment_map = {"positive": 0.8, "neutral": 0.5, "negative": 0.2}
                    sentiment = sentiment_map.get(sentiment.lower(), 0.5)
                
                utterance = TranscriptUtterance(
                    call_id=call_id,
                    timestamp=timestamp,
                    speaker_id=speaker_id,
                    speaker_name=speaker_name,
                    utterance=text,
                    sentiment_score=sentiment,
                    source_file=source_file,
                    metadata={k: v for k, v in item.items() if k not in ["sentence", "text", "utterance", "speaker_name", "speaker", "time", "timestamp", "sentiment_score", "sentiment"]}
                )
                utterances.append(utterance)
            except Exception as e:
                logger.warning(f"Anomaly: Failed to harmonize utterance at index {index} in {source_file}: {e}")
                
        return utterances

    def harmonize_metadata(self, raw_data: Dict[str, Any], call_id: str) -> Optional[CallMetadata]:
        """Normalizes various metadata structures."""
        try:
            return CallMetadata(
                call_id=call_id,
                title=raw_data.get("title") or raw_data.get("meetingName"),
                organizer=raw_data.get("organizerEmail") or raw_data.get("owner"),
                start_time=str(raw_data.get("startTime") or raw_data.get("start_date", "")),
                end_time=str(raw_data.get("endTime") or raw_data.get("end_date", "")),
                duration=float(raw_data.get("duration") or 0.0),
                participants=raw_data.get("participants") or []
            )
        except Exception as e:
            logger.warning(f"Anomaly: Failed to harmonize metadata for {call_id}: {e}")
            return None

    def _normalize_timestamp(self, raw_ts: Any) -> float:
        """Converts various timestamp formats to unix float."""
        if isinstance(raw_ts, (int, float)):
            return float(raw_ts)
        if isinstance(raw_ts, str):
            try:
                # Try parsing as ISO string
                dt = parser.parse(raw_ts)
                return dt.timestamp()
            except:
                # Try parsing as stringified float
                try:
                    return float(raw_ts)
                except:
                    pass
        return 0.0
