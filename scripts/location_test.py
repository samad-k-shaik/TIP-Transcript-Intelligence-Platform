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
    locations = ["us-central1", "us-east1", "us-west1", "europe-west1"]
    
    models_to_try = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ]
    
    for loc in locations:
        print(f"Testing location: {loc}")
        vertexai.init(project=project_id, location=loc)
        for m in models_to_try:
            success, res = test_model(m)
            if success:
                print(f"SUCCESS: {m} in {loc}")
                return
            else:
                print(f"FAILED: {m} in {loc} - {res}")

if __name__ == "__main__":
    main()
