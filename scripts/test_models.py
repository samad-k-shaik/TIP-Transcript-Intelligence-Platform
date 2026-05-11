import vertexai
from vertexai.generative_models import GenerativeModel
import os

def list_models():
    project_id = os.getenv("GCP_PROJECT_ID", "tip-intelligence-platform")
    location = "us-central1"
    vertexai.init(project=project_id, location=location)
    
    # Try a simple generation to see if it works with a very common model
    try:
        model = GenerativeModel("gemini-1.0-pro")
        response = model.generate_content("Hi")
        print(f"gemini-1.0-pro works: {response.text}")
    except Exception as e:
        print(f"gemini-1.0-pro failed: {e}")

    try:
        model = GenerativeModel("gemini-1.5-flash-001")
        response = model.generate_content("Hi")
        print(f"gemini-1.5-flash-001 works: {response.text}")
    except Exception as e:
        print(f"gemini-1.5-flash-001 failed: {e}")

if __name__ == "__main__":
    list_models()
