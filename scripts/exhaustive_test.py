import vertexai
from vertexai.generative_models import GenerativeModel
import os

def test_model(model_name):
    try:
        model = GenerativeModel(model_name)
        response = model.generate_content("test")
        return True, response.text
    except Exception as e:
        return False, str(e)

def main():
    project_id = os.getenv("GCP_PROJECT_ID", "tip-intelligence-platform")
    location = "us-central1"
    vertexai.init(project=project_id, location=location)
    
    models_to_try = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro-002"
    ]
    
    for m in models_to_try:
        success, res = test_model(m)
        if success:
            print(f"SUCCESS: {m}")
            return
        else:
            print(f"FAILED: {m} - {res}")

if __name__ == "__main__":
    main()
