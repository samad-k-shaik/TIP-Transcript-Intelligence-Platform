import os
import json
import random
from pathlib import Path
from datetime import datetime, timedelta

def generate_enterprise_data(base_dir: str = "datasets"):
    """Generates a rich, realistic enterprise dataset with varied call types."""
    base_path = Path(base_dir)
    base_path.mkdir(parents=True, exist_ok=True)

    # Speakers by department
    speakers = {
        "Engineering": ["Alice Chen", "David Kumar", "Sarah Jenkins", "Michael Ross"],
        "Product": ["Bob Smith", "Elena Rodriguez", "James Wilson"],
        "Sales/AM": ["Frank Miller", "Grace Hopper", "Henry Ford", "Isabel Garcia"],
        "Support": ["Kevin Hart", "Laura Palmer", "Mike Wazowski"],
        "Customers": ["John Customer", "Jane User", "Tech Lead at Acme", "CTO of Globex"]
    }

    # Call Themes
    themes = [
        {
            "type": "SUPPORT",
            "topics": ["API Bug", "Latency Issues", "Billing", "SSO Login", "Mobile App Crash"],
            "titles": ["Critical: API Rate Limiting for Acme", "Billing Discrepancy Support Call", "SSO Configuration Issue", "Dashboard Loading Latency", "Mobile App Crash Report"],
            "templates": [
                "Customer: I'm seeing a 429 error whenever we hit the /v1/ingest endpoint.",
                "Support: Let me check the logs. Yes, it seems you've exceeded the burst limit.",
                "Customer: But we are on the Enterprise tier, shouldn't that be higher?",
                "Support: You're right. I'll escalate this to engineering to bump your limits.",
                "Customer: Thanks, we have a major deployment coming up and need this resolved."
            ]
        },
        {
            "type": "EXTERNAL",
            "topics": ["Renewal", "Expansion", "Feedback", "Pricing", "Demo"],
            "titles": ["Acme Corp - Q3 Renewal Discussion", "Globex Expansion Opportunity", "Feedback Session: New Analytics UI", "Pricing Negotiation for 2024", "Product Demo: Intelligence Hub"],
            "templates": [
                "AM: We've seen great adoption of the platform within your engineering team.",
                "Customer: Yes, the team loves the new automated insights.",
                "AM: Based on your current usage, we should discuss expanding to the marketing team.",
                "Customer: We're interested, but we need to see a better price point for the additional seats.",
                "AM: I'll talk to my sales director and get back to you with a revised proposal."
            ]
        },
        {
            "type": "INTERNAL",
            "topics": ["Sprint Planning", "Incident Review", "Roadmap", "Design Sync", "Database Migration"],
            "titles": ["Sprint Planning - Week 24", "Post-Mortem: DB Migration Outage", "2024 Product Roadmap Review", "Design System: Glassmorphism Update", "Architecture Review: Scaling Ingestion"],
            "templates": [
                "Eng Lead: We need to finish the Polars migration by Friday.",
                "Product: What's the status of the new dashboard widgets?",
                "Eng: We're still seeing some issues with Recharts rendering on mobile.",
                "Product: That's a priority for the upcoming sales demo.",
                "Eng: Understood. I'll assign David to focus exclusively on that today."
            ]
        }
    ]

    # Generate 30 calls
    for i in range(1, 31):
        theme = random.choice(themes)
        call_id = f"call_{200 + i}"
        call_dir = base_path / call_id
        call_dir.mkdir(exist_ok=True)

        title = random.choice(theme["titles"])
        topic = random.choice(theme["topics"])
        
        # Random start time within the last 14 days
        start_dt = datetime.now() - timedelta(days=random.randint(0, 14), hours=random.randint(0, 23))
        
        # 1. Metadata
        metadata = {
            "meetingId": call_id,
            "title": title,
            "organizerEmail": f"{random.choice(speakers['Engineering'] + speakers['Product'] + speakers['Sales/AM']).lower().replace(' ', '.')}@enterprise.com",
            "startTime": start_dt.isoformat(),
            "duration": random.randint(600, 3600)
        }
        with open(call_dir / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

        # 2. Speaker Mapping
        # Pick 2-4 speakers
        if theme["type"] == "SUPPORT":
            current_speakers = [random.choice(speakers["Support"]), random.choice(speakers["Customers"])]
        elif theme["type"] == "EXTERNAL":
            current_speakers = [random.choice(speakers["Sales/AM"]), random.choice(speakers["Customers"])]
        else:
            current_speakers = random.sample(speakers["Engineering"] + speakers["Product"], random.randint(2, 3))
            
        mapping = [{"speaker_id": f"spk_{idx}", "speakerName": name} for idx, name in enumerate(current_speakers)]
        with open(call_dir / "speaker_mapping.json", "w") as f:
            json.dump(mapping, f, indent=2)

        # 3. Transcript
        utterances = []
        for idx in range(15): # 15 lines per call
            spk_obj = random.choice(mapping)
            utt_time = start_dt + timedelta(seconds=idx * 20)
            
            # Simple sentence generation based on theme
            if idx < len(theme["templates"]):
                sentence = theme["templates"][idx]
            else:
                sentence = f"Discussion point {idx} regarding {topic} and its impact on our workflow."
                
            utterances.append({
                "speaker_id": spk_obj["speaker_id"],
                "sentence": sentence,
                "time": utt_time.timestamp(),
                "sentiment_score": random.uniform(0.1, 0.9)
            })
            
        with open(call_dir / "transcript.json", "w") as f:
            json.dump({"data": utterances}, f, indent=2)

        # 4. Summary Placeholder
        with open(call_dir / "summary.json", "w") as f:
            json.dump({"summary": f"Discussion about {title} focusing on {topic}."}, f, indent=2)

    print(f"Generated 30 enterprise-grade calls in {base_dir}")

if __name__ == "__main__":
    generate_enterprise_data()
