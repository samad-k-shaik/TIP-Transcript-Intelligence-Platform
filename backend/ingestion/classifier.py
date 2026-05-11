import orjson
from pathlib import Path
from typing import Tuple, Dict, Any
from ..models.schema_models import SchemaType
from ..utils.logger import logger

class Classifier:
    """Dynamic schema classification engine based on JSON keys."""
    
    RULES = {
        SchemaType.TRANSCRIPT: ["data", "utterances", "sentences", "transcript", "text", "sentence"],
        SchemaType.METADATA: ["meetingId", "call_id", "organizerEmail", "startTime", "duration", "title"],
        SchemaType.SPEAKER_MAPPING: ["speakerName", "speakers", "mapping", "speaker_id", "identity"],
        SchemaType.SUMMARY: ["summary", "abstract", "highlights", "conclusion"],
        SchemaType.EVENTS: ["events", "interactions", "actions", "triggers"]
    }

    def classify(self, content: bytes = None, file_path: Path = None) -> Tuple[SchemaType, float]:
        """Classifies content based on its keys with confidence scoring."""
        try:
            if file_path:
                with open(file_path, "rb") as f:
                    content = f.read()
            
            if not content:
                return SchemaType.UNKNOWN, 0.0
                
            data = orjson.loads(content)
            
            if not isinstance(data, (dict, list)):
                return SchemaType.UNKNOWN, 0.0

            # Inspect structure
            is_list = isinstance(data, list)
            keys = set()
            if isinstance(data, dict):
                keys.update(data.keys())
                # If it's a wrapped list, peek into the first item
                for wrapper in ["data", "utterances", "sentences", "items"]:
                    if wrapper in data and isinstance(data[wrapper], list) and len(data[wrapper]) > 0:
                        first_item = data[wrapper][0]
                        if isinstance(first_item, dict):
                            keys.update(first_item.keys())
                            break
            elif isinstance(data, list) and len(data) > 0:
                if isinstance(data[0], dict):
                    keys.update(data[0].keys())

            best_type = SchemaType.UNKNOWN
            max_matches = 0
            total_rules = 0
            
            for schema_type, rule_keys in self.RULES.items():
                matches = len(keys.intersection(set(rule_keys)))
                if matches > max_matches:
                    max_matches = matches
                    best_type = schema_type
                    total_rules = len(rule_keys)

            # Heuristics for higher confidence
            confidence = min(1.0, (max_matches / 2.0)) if max_matches > 0 else 0.0
            
            # Boost confidence for specific high-signal structures
            if best_type == SchemaType.TRANSCRIPT:
                if "data" in keys or "utterances" in keys:
                    confidence = min(1.0, confidence + 0.3)
            
            if best_type == SchemaType.METADATA:
                if "meetingId" in keys and "startTime" in keys:
                    confidence = 1.0

            return best_type, confidence

        except Exception as e:
            logger.warning(f"Anomaly: Classification error for {file_path}: {e}")
            return SchemaType.UNKNOWN, 0.0
