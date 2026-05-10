import asyncio
import sys
import os
from pathlib import Path

# Add the project root to sys.path
sys.path.append(str(Path(__file__).parent))

from backend.ingestion.ingestion_service import IngestionService
from backend.utils.logger import logger

async def main():
    dataset_path = "/Users/abdussamad/Downloads/interview-assignment 2/dataset"
    if not os.path.exists(dataset_path):
        logger.error(f"Dataset path not found: {dataset_path}")
        return

    logger.info("Starting verification run...")
    service = IngestionService(root_dir=dataset_path)
    status = await service.run_pipeline()
    
    print("\n--- Ingestion Results ---")
    print(f"Total Files: {status.total_files}")
    print(f"Processed: {status.processed_files}")
    print(f"Errors: {status.errors}")
    print(f"Last Run: {status.last_run}")
    print("-------------------------\n")
    
    # Check if parquet files were created
    parquet_dir = Path("parquet")
    if parquet_dir.exists():
        files = list(parquet_dir.glob("*.parquet"))
        print(f"Generated Parquet Files: {[f.name for f in files]}")
    else:
        print("Error: Parquet directory not created!")

if __name__ == "__main__":
    asyncio.run(main())
