from typing import List, Dict, Any
from ..models.transcript_models import TranscriptUtterance
from ..utils.logger import logger

class Resolver:
    """Resolves speaker IDs to names using mapping files."""

    def __init__(self):
        self.mappings: Dict[str, Dict[str, str]] = {} # call_id -> {speaker_id -> name}

    def load_mappings(self, call_id: str, raw_mapping: Any) -> None:
        """Loads a mapping file for a specific call."""
        if call_id not in self.mappings:
            self.mappings[call_id] = {}
            
        if isinstance(raw_mapping, list):
            for item in raw_mapping:
                # Check for various mapping structures
                name = item.get("speakerName") or item.get("name")
                sid = str(item.get("speaker_id") or item.get("id", ""))
                if name and sid:
                    self.mappings[call_id][sid] = name
        elif isinstance(raw_mapping, dict):
            # If it's a direct mapping dict
            for sid, name in raw_mapping.items():
                self.mappings[call_id][str(sid)] = str(name)

    def resolve(self, utterances: List[TranscriptUtterance]) -> List[TranscriptUtterance]:
        """Applies loaded mappings to a list of utterances."""
        for utt in utterances:
            if utt.call_id in self.mappings:
                mapping = self.mappings[utt.call_id]
                if utt.speaker_id in mapping:
                    utt.speaker_name = mapping[utt.speaker_id]
                elif utt.speaker_name == "Unknown Speaker":
                    # Try fuzzy match if needed, but let's keep it simple for now
                    pass
        return utterances
