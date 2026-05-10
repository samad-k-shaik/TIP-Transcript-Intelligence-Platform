from typing import List, Dict, Any, Optional
from ..models.transcript_models import TranscriptUtterance
from ..utils.logger import logger

class Harmonizer:
    """Normalizes heterogeneous transcript structures into a unified schema."""

    def harmonize(self, raw_data: Dict[str, Any], call_id: str, source_file: str) -> List[TranscriptUtterance]:
        """Maps raw JSON data to a list of TranscriptUtterance models."""
        utterances = []
        
        # Determine where the list of utterances is
        items = []
        if isinstance(raw_data, list):
            items = raw_data
        elif "data" in raw_data and isinstance(raw_data["data"], list):
            items = raw_data["data"]
        elif "utterances" in raw_data and isinstance(raw_data["utterances"], list):
            items = raw_data["utterances"]
        elif "sentences" in raw_data and isinstance(raw_data["sentences"], list):
            items = raw_data["sentences"]
        
        for index, item in enumerate(items):
            try:
                # Handle schema drift by checking multiple potential keys
                text = item.get("sentence") or item.get("text") or item.get("utterance") or ""
                if not text:
                    continue
                
                speaker_id = str(item.get("speaker_id", ""))
                speaker_name = item.get("speaker_name") or item.get("speaker") or "Unknown Speaker"
                
                # Standardize timestamps
                timestamp = item.get("time") or item.get("timestamp") or item.get("start_time") or 0.0
                
                # Extract sentiment if available
                sentiment = item.get("sentiment_score") or item.get("sentiment")
                if isinstance(sentiment, str):
                    # Mock mapping if it's a label
                    sentiment = 0.5 if sentiment.lower() == "neutral" else 0.8
                
                utterance = TranscriptUtterance(
                    call_id=call_id,
                    timestamp=float(timestamp),
                    speaker_id=speaker_id,
                    speaker_name=speaker_name,
                    utterance=text,
                    sentiment_score=sentiment,
                    source_file=source_file,
                    metadata={k: v for k, v in item.items() if k not in ["sentence", "text", "utterance", "speaker_name", "speaker", "time", "timestamp"]}
                )
                utterances.append(utterance)
            except Exception as e:
                logger.warning(f"Anomaly: Failed to harmonize utterance at index {index} in {source_file}: {e}")
                
        return utterances
