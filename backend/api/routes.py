from fastapi import APIRouter, BackgroundTasks, HTTPException
from typing import List, Dict, Any
from pathlib import Path
from datetime import datetime
from ..ingestion.ingestion_service import IngestionService
from ..services.data_service import DataService
from ..models.schema_models import IngestionStatus, IngestRequest
from ..services.ai_service import AIService
from google.cloud import storage
import json
import os
import polars as pl

router = APIRouter()

# Services
service = IngestionService(root_dir="datasets")
data_service = DataService(parquet_dir="parquet")

@router.post("/ingest", response_model=Dict[str, str])
async def trigger_ingestion(request: IngestRequest, background_tasks: BackgroundTasks):
    """Triggers the ingestion pipeline in the background."""
    if service.status.is_running:
        raise HTTPException(status_code=400, detail="Ingestion already in progress")
    
    background_tasks.add_task(service.run_pipeline, request.dataset)
    return {"message": f"Ingestion pipeline triggered for dataset: {request.dataset or 'default'}"}

@router.get("/dashboard/available-datasets", response_model=List[str])
async def list_available_datasets():
    """Lists sub-directories in the datasets source (local or GCS)."""
    if service.storage_type == "gcs":
        try:
            client = storage.Client(project=service.project_id)
            # List blobs with delimiter to get folders under datasets_tip prefix
            blobs = client.list_blobs(service.bucket_name, prefix="datasets_tip/", delimiter='/')
            list(blobs) # Force initialization
            folders = []
            for p in blobs.prefixes:
                rel = p[len("datasets_tip/"):] if p.startswith("datasets_tip/") else p
                rel = rel.strip("/")
                if rel:
                    folders.append(rel)
            return sorted(folders)
        except Exception as e:
            print(f"Error listing GCS datasets: {e}")
            return []
    
    # Local fallback
    datasets_dir = Path("datasets_tip")
    if not datasets_dir.exists():
        datasets_dir = Path("datasets")
    if not datasets_dir.exists():
        return []
    
    # Return names of sub-directories
    return sorted([d.name for d in datasets_dir.iterdir() if d.is_dir() and not d.name.startswith(".")])

@router.get("/status", response_model=IngestionStatus)
async def get_status():
    """Retrieves the current status of the ingestion pipeline."""
    return service.status

@router.get("/dashboard/ingested-datasets", response_model=List[str])
async def get_ingested_datasets():
    """Returns a list of all datasets present in the ingested parquet databases."""
    return data_service.get_ingested_datasets()

@router.get("/dashboard/stats")
async def get_dashboard_stats(dataset: str = None):
    """Returns KPI statistics for the dashboard."""
    return data_service.get_stats(dataset)

@router.get("/dashboard/sentiment")
async def get_dashboard_sentiment(dataset: str = None):
    """Returns sentiment trend for the dashboard."""
    return data_service.get_sentiment_trend(dataset)

@router.get("/dashboard/sentiment-by-type")
async def get_sentiment_by_type(dataset: str = None):
    """Returns sentiment grouped by call type."""
    return data_service.get_sentiment_by_type(dataset)

@router.get("/dashboard/topics")
async def get_dashboard_topics(dataset: str = None):
    """Returns primary topics distribution."""
    return data_service.get_topic_distribution(dataset)

@router.get("/dashboard/categories")
async def get_dashboard_categories(dataset: str = None):
    """Returns issue categories for the dashboard."""
    return data_service.get_issue_categories(dataset)

@router.get("/dashboard/summary")
async def get_dashboard_summary(dataset: str = None):
    """Returns aggregated executive summary."""
    return data_service.get_executive_summary(dataset)

@router.get("/dashboard/gaps")
async def get_dashboard_gaps(dataset: str = None):
    """Returns feature gap intelligence."""
    return data_service.get_feature_gaps(dataset)

@router.get("/dashboard/validation")
async def get_dashboard_validation(dataset: str = None):
    """Returns validation metrics."""
    return data_service.get_validation_metrics(dataset)

@router.get("/dashboard/conversations")
async def get_dashboard_conversations(dataset: str = None):
    """Returns list of conversations."""
    return data_service.get_conversation_list(dataset)

@router.get("/dashboard/speakers")
async def get_dashboard_speakers(dataset: str = None):
    """Returns detailed list of active speakers."""
    return data_service.get_active_speakers(dataset)

@router.get("/analyze/{call_id}")
async def get_detailed_analysis(call_id: str):
    """Retrieves or generates a detailed AI summary for a specific call."""
    # First, try to get existing metadata summary
    meta_df = data_service.get_metadata()
    existing_summary = None
    if not meta_df.is_empty() and "call_id" in meta_df.columns:
        call_meta = meta_df.filter(pl.col("call_id") == call_id)
        if not call_meta.is_empty() and "summary" in call_meta.columns:
            existing_summary = call_meta["summary"][0]
            
    # Then get utterances to send to AI if needed for deep dive
    conv_df = data_service.get_conversations()
    if not conv_df.is_empty() and "call_id" in conv_df.columns:
        utterances = conv_df.filter(pl.col("call_id") == call_id)
        if not utterances.is_empty():
            # Construct text
            text_lines = []
            conversation_data = []
            for row in utterances.to_dicts():
                speaker = row.get('speaker_name', 'Unknown')
                text = row.get('utterance', '')
                text_lines.append(f"{speaker}: {text}")
                conversation_data.append({"speaker": speaker, "text": text})
                
            full_text = "\n".join(text_lines)
            
            # Use AIService for deep analysis
            ai = AIService(project_id=service.project_id)
            # Since analyze_transcript returns a dict with basic summary, we can customize a deeper prompt here if we want, 
            # or just return the existing AI analysis + transcript length info.
            # To be fast and robust, let's use the existing one but present it clearly.
            analysis = await ai.analyze_transcript(full_text)
            return {
                "call_id": call_id,
                "detailed_summary": analysis.get("summary", existing_summary),
                "sentiment": analysis.get("sentiment"),
                "primary_topic": analysis.get("primary_topic"),
                "utterance_count": len(text_lines),
                "participants": list(set([row.get('speaker_name', 'Unknown') for row in utterances.to_dicts()])),
                "conversation": conversation_data
            }
            
    return {"error": "Transcript not found or could not be analyzed."}

@router.get("/anomalies", response_model=List[Dict[str, str]])
async def get_anomalies():
    """Retrieves recent anomalies from the log file."""
    log_path = Path("logs/anomalies.log")
    if not log_path.exists():
        return []
    
    anomalies = []
    try:
        with open(log_path, "r") as f:
            lines = f.readlines()
            for line in lines[-100:]: # Last 100 anomalies
                parts = line.split("|")
                if len(parts) >= 4:
                    anomalies.append({
                        "timestamp": parts[0].strip(),
                        "level": parts[1].strip(),
                        "module": parts[2].strip(),
                        "message": parts[3].strip()
                    })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read logs: {e}")
    return anomalies

@router.get("/datasets", response_model=List[Dict[str, Any]])
async def list_datasets():
    """Lists generated parquet datasets and their metadata."""
    parquet_dir = Path("parquet")
    if not parquet_dir.exists():
        return []
    
    datasets = []
    for p in parquet_dir.glob("*.parquet"):
        stats = p.stat()
        datasets.append({
            "name": p.name,
            "size_kb": round(stats.st_size / 1024, 2),
            "last_modified": datetime.fromtimestamp(stats.st_mtime).isoformat()
        })
    return datasets

@router.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}
