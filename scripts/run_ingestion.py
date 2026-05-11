import asyncio
import os
from backend.ingestion.ingestion_service import IngestionService

async def main():
    # Ensure GCP_PROJECT_ID is set (using the one from the user environment if possible)
    # If not set, we'll try to use a default or ask
    project_id = os.getenv("GCP_PROJECT_ID")
    if not project_id:
        print("Error: GCP_PROJECT_ID environment variable not set.")
        return

    print(f"Starting ingestion pipeline for project: {project_id}...")
    service = IngestionService(root_dir="datasets")
    status = await service.run_pipeline()
    
    print("\nPipeline Status:")
    print(f"Processed Files: {status.processed_files}")
    print(f"Total Files: {status.total_files}")
    print(f"Errors: {status.errors}")
    print(f"Last Run: {status.last_run}")

if __name__ == "__main__":
    asyncio.run(main())
