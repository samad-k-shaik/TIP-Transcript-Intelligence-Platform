import pytest
from pathlib import Path
import json
from backend.ingestion.scanner import Scanner
from backend.ingestion.classifier import Classifier
from backend.ingestion.harmonizer import Harmonizer
from backend.models.schema_models import SchemaType

@pytest.fixture
def sample_json(tmp_path):
    d = tmp_path / "call_1"
    d.mkdir()
    f = d / "transcript.json"
    content = {
        "data": [
            {"speaker_id": "spk_1", "sentence": "Hello", "time": 1000.0}
        ]
    }
    f.write_text(json.dumps(content))
    return f

def test_classifier_transcript(sample_json):
    classifier = Classifier()
    detected_type, confidence = classifier.classify(sample_json)
    assert detected_type == SchemaType.TRANSCRIPT
    assert confidence > 0.8

def test_scanner_discovers_files(tmp_path, sample_json):
    scanner = Scanner(str(tmp_path))
    discovered = scanner.scan()
    assert len(discovered) == 1
    assert discovered[0].file_name == "transcript.json"
    assert discovered[0].detected_type == SchemaType.TRANSCRIPT

def test_harmonizer_normalization():
    harmonizer = Harmonizer()
    raw_data = {
        "data": [
            {"speaker_id": "spk_1", "sentence": "Hello world", "time": "2024-01-01T12:00:00Z"}
        ]
    }
    utterances = harmonizer.harmonize_transcript(raw_data, "call_1", "test.json")
    assert len(utterances) == 1
    assert utterances[0].speaker_id == "spk_1"
    assert utterances[0].utterance == "Hello world"
    assert isinstance(utterances[0].timestamp, float)
    assert utterances[0].timestamp > 0

def test_harmonizer_metadata():
    harmonizer = Harmonizer()
    raw_data = {
        "meetingId": "m1",
        "title": "Test Meeting",
        "startTime": "2024-01-01T12:00:00Z"
    }
    meta = harmonizer.harmonize_metadata(raw_data, "m1")
    assert meta is not None
    assert meta.call_id == "m1"
    assert meta.title == "Test Meeting"
