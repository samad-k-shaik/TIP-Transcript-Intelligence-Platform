import os
import json
import random
from pathlib import Path
from datetime import datetime, timedelta

def generate_sample_data(base_dir: str = "datasets"):
    """Generates a complex, enterprise-style dataset for demo purposes."""
    base_path = Path(base_dir)
    base_path.mkdir(parents=True, exist_ok=True)

    calls = [
        {"id": "call_101", "name": "Quarterly Planning", "speakers": {"spk_1": "Alice Chen", "spk_2": "Bob Smith"}},
        {"id": "call_102", "name": "Technical Deep Dive", "speakers": {"spk_1": "Charlie Day", "spk_2": "Diana Prince"}},
        {"id": "call_103", "name": "Customer Feedback", "speakers": {"spk_1": "Eve Adams", "spk_2": "Frank Miller"}},
        {"id": "call_104_malformed", "name": "Broken Call", "speakers": {}},
        {"id": "call_105_drift", "name": "Schema Drift Call", "speakers": {"spk_1": "Grace Hopper"}},
    ]

    for call in calls:
        call_dir = base_path / call["id"]
        call_dir.mkdir(exist_ok=True)

        # 1. Generate Metadata
        metadata = {
            "meetingId": call["id"],
            "title": call["name"],
            "organizerEmail": f"{call['id']}@enterprise.com",
            "startTime": (datetime.now() - timedelta(days=random.randint(1, 10))).isoformat(),
            "duration": random.randint(300, 3600)
        }
        with open(call_dir / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

        # 2. Generate Speaker Mapping
        if call["speakers"]:
            mapping = []
            for sid, name in call["speakers"].items():
                mapping.append({"speaker_id": sid, "speakerName": name})
            
            with open(call_dir / "speaker_mapping.json", "w") as f:
                json.dump(mapping, f, indent=2)

        # 3. Generate Transcript (Varying schemas)
        utterances = []
        start_time = datetime.now()
        
        for i in range(10):
            spk_id = random.choice(list(call["speakers"].keys())) if call["speakers"] else "unknown"
            utt_time = start_time + timedelta(seconds=i * 10)
            
            # Scenario-based schema drift
            if "drift" in call["id"]:
                # Uses 'text' instead of 'sentence' and 'timestamp' instead of 'time'
                utterances.append({
                    "speaker_id": spk_id,
                    "text": f"This is utterance {i} for {call['name']} (drift schema)",
                    "timestamp": utt_time.isoformat(),
                    "sentiment": random.choice(["positive", "neutral", "negative"])
                })
            else:
                # Uses 'sentence' and 'time'
                utterances.append({
                    "speaker_id": spk_id,
                    "sentence": f"Hello, this is utterance {i} in the standard schema.",
                    "time": utt_time.timestamp(),
                    "sentiment_score": random.random()
                })

        if "malformed" in call["id"]:
            # Write invalid JSON
            with open(call_dir / "transcript.json", "w") as f:
                f.write('{"data": [ { "id": 1, "text": "oops", } ] }') # Extra comma
        else:
            transcript_data = {"data": utterances} if "drift" not in call["id"] else utterances
            with open(call_dir / "transcript.json", "w") as f:
                json.dump(transcript_data, f, indent=2)

        # 4. Generate some random extra files
        with open(call_dir / "summary.json", "w") as f:
            json.dump({"summary": f"This was a great meeting about {call['name']}"}, f, indent=2)

    print(f"Sample data generated in {base_dir}")

if __name__ == "__main__":
    generate_sample_data()
