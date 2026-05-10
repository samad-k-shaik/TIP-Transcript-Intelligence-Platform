from fastapi import APIRouter, BackgroundTasks, HTTPException
from typing import List, Dict, Any
from pathlib import Path
from ..ingestion.ingestion_service import IngestionService
from ..models.schema_models import IngestionStatus

router = APIRouter()

# In-memory store for demo
# In production, use Redis or Postgres
service = IngestionService(root_dir="datasets")
current_status = IngestionStatus()

@router.post("/ingest", response_model=Dict[str, str])
async def trigger_ingestion(background_tasks: BackgroundTasks):
    """Triggers the ingestion pipeline in the background."""
    if current_status.is_running:
        raise HTTPException(status_code=400, detail="Ingestion already in progress")
    
    background_tasks.add_task(run_ingestion)
    return {"message": "Ingestion pipeline triggered"}

@router.get("/status", response_model=IngestionStatus)
async def get_status():
    """Retrieves the current status of the ingestion pipeline."""
    return current_status

@router.get("/anomalies", response_model=List[Dict[str, str]])
async def get_anomalies():
    """Retrieves recent anomalies from the log file."""
    log_path = Path("logs/anomalies.log")
    if not log_path.exists():
        return []
    
    anomalies = []
    with open(log_path, "r") as f:
        for line in f.readlines()[-50:]: # Last 50 anomalies
            parts = line.split("|")
            if len(parts) >= 4:
                anomalies.append({
                    "timestamp": parts[0].strip(),
                    "level": parts[1].strip(),
                    "message": parts[3].strip()
                })
    return anomalies

@router.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}

async def run_ingestion():
    global current_status
    current_status = await service.run_pipeline()
