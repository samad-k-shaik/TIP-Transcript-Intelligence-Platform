import vertexai
from vertexai.generative_models import GenerativeModel, Part
import logging
import json
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class AIService:
    """
    Service for interacting with Vertex AI (Gemini) for transcript analysis.
    """
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        try:
            vertexai.init(project=project_id, location=location)
            self.model = GenerativeModel("gemini-1.5-flash")
            logger.info(f"AIService initialized with project {project_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {str(e)}")
            self.model = None

    async def analyze_transcript(self, content: str) -> Dict[str, Any]:
        """
        Uses Gemini to generate a summary, analyze sentiment, and categorize the transcript.
        Includes a robust fallback for demo stability.
        """
        if not self.model:
            return self._get_fallback_analysis(content)

        prompt = f"""
        Analyze the following transcript and provide a structured analysis for an enterprise platform.
        
        Requirements:
        1. SUMMARY: A concise summary (max 3 sentences).
        2. SENTIMENT: Overall sentiment (POSITIVE, NEGATIVE, or NEUTRAL).
        3. CALL_TYPE: Classify as one of: [customer support calls, external calls, internal calls].
        4. PRIMARY_TOPIC: A 1-2 word label for the main theme (e.g., "Pricing", "API Bug", "Sprint Planning").
        5. STAKEHOLDER_IMPACT: List which roles would care most: [product managers, engineering leads, sales managers, support leaders].

        Return ONLY a JSON object with keys: 'summary', 'sentiment', 'call_type', 'primary_topic', 'stakeholder_impact'.
        
        Transcript:
        {content[:15000]}
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].strip()
            
            result = json.loads(text)
            return {
                "summary": result.get("summary", "No summary generated"),
                "sentiment": result.get("sentiment", "NEUTRAL"),
                "call_type": result.get("call_type", "internal calls").lower(),
                "primary_topic": result.get("primary_topic", "General"),
                "stakeholder_impact": result.get("stakeholder_impact", [])
            }
        except Exception as e:
            logger.warning(f"AI analysis failed ({str(e)}), using fallback logic.")
            return self._get_fallback_analysis(content)

    def _get_fallback_analysis(self, content: str) -> Dict[str, Any]:
        """Keyword-based heuristic analysis for fallback cases."""
        content_lower = content.lower()
        
        # Heuristic for Call Type
        call_type = "internal calls"
        if any(w in content_lower for w in ["support", "bug", "error", "429", "latency", "crash"]):
            call_type = "customer support calls"
        elif any(w in content_lower for w in ["renewal", "pricing", "contract", "expansion", "demo", "sales"]):
            call_type = "external calls"
            
        # Heuristic for Sentiment
        sentiment = "NEUTRAL"
        if any(w in content_lower for w in ["great", "happy", "love", "thanks", "resolved", "awesome"]):
            sentiment = "POSITIVE"
        elif any(w in content_lower for w in ["issue", "problem", "broken", "fail", "slow", "annoying"]):
            sentiment = "NEGATIVE"
            
        # Heuristic for Topics
        topic = "General Discussion"
        for t in ["Pricing", "API Bug", "Sprint Planning", "SSO", "Database", "Renewal"]:
            if t.lower() in content_lower:
                topic = t
                break

        # Heuristic for Impact
        impact = ["product managers"]
        if call_type == "customer support calls": impact.extend(["support leaders", "engineering leads"])
        if call_type == "external calls": impact.extend(["sales managers", "product managers"])
        if call_type == "internal calls": impact.extend(["engineering leads", "product managers"])

        detailed_summary = (
            f"This conversation is categorized as {call_type} focusing on {topic}. "
            f"The primary sentiment expressed is {sentiment}. "
            "(Detailed insights generated via deterministic fallback engine)."
        )

        return {
            "summary": detailed_summary,
            "sentiment": sentiment,
            "call_type": call_type,
            "primary_topic": topic,
            "stakeholder_impact": list(set(impact))
        }
