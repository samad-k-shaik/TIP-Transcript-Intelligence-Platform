import orjson
from pathlib import Path
from typing import Tuple, Dict, Any
from ..models.schema_models import SchemaType
from ..utils.logger import logger

class Classifier:
    """Dynamic schema classification engine based on JSON keys."""
    
    RULES = {
        SchemaType.TRANSCRIPT: ["data", "utterances", "sentences", "transcript"],
        SchemaType.METADATA: ["meetingId", "call_id", "organizerEmail", "startTime"],
        SchemaType.SPEAKER_MAPPING: ["speakerName", "speakers", "mapping", "speaker_id"],
        SchemaType.SUMMARY: ["summary", "abstract", "highlights"],
        SchemaType.EVENTS: ["events", "interactions", "actions"]
    }

    def classify(self, file_path: Path) -> Tuple[SchemaType, float]:
        """Classifies a file based on its content keys."""
        try:
            with open(file_path, "rb") as f:
                data = orjson.loads(f.read())
            
            if not isinstance(data, (dict, list)):
                return SchemaType.UNKNOWN, 0.0

            # If it's a list, check the first element if it's a dict
            sample = data[0] if isinstance(data, list) and len(data) > 0 else data
            if not isinstance(sample, dict):
                # Fallback for simple lists like speakers
                if isinstance(data, list) and len(data) > 0 and "speakerName" in data[0]:
                    return SchemaType.SPEAKER_MAPPING, 0.9
                return SchemaType.UNKNOWN, 0.0

            keys = set(sample.keys()) if isinstance(sample, dict) else set()
            if isinstance(data, dict):
                keys.update(data.keys())

            best_type = SchemaType.UNKNOWN
            max_matches = 0
            
            for schema_type, rule_keys in self.RULES.items():
                matches = len(keys.intersection(set(rule_keys)))
                if matches > max_matches:
                    max_matches = matches
                    best_type = schema_type

            confidence = min(1.0, max_matches / 2.0) if max_matches > 0 else 0.0
            
            # Special handling for 'transcript.json' style files where 'data' is the only key
            if "data" in keys and isinstance(data.get("data"), list) and len(data["data"]) > 0:
                if "sentence" in data["data"][0] or "text" in data["data"][0]:
                    return SchemaType.TRANSCRIPT, 1.0

            return best_type, confidence

        except Exception as e:
            logger.debug(f"Classification error for {file_path}: {e}")
            return SchemaType.UNKNOWN, 0.0
