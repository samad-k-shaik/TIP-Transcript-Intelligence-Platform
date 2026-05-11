import asyncio
from google.cloud import storage
from typing import List
from pathlib import Path
from .base_scanner import BaseScanner
from .classifier import Classifier
from ..models.schema_models import FileDiscovery, SchemaType, PipelineStage
from ..utils.logger import logger

class GCSScanner(BaseScanner):
    """Discovery engine for Google Cloud Storage buckets."""
    
    def __init__(self, bucket_name: str, project_id: str = None):
        self.bucket_name = bucket_name
        self.client = storage.Client(project=project_id)
        self.bucket = self.client.bucket(bucket_name)
        self.classifier = Classifier()

    async def scan(self, path: str = None, status_callback=None) -> List[FileDiscovery]:
        """Lists blobs in the bucket and classifies JSON files."""
        discovered_files = []
        prefix = path if path else ""
        logger.info(f"Starting GCS scan of bucket: {self.bucket_name} with prefix: {prefix}")
        
        try:
            # 1. Discovery Phase
            if status_callback:
                status_callback(
                    current_stage=PipelineStage.DISCOVERY,
                    stage_progress=0.1,
                    status_message=f"Scanning GCS bucket: {self.bucket_name}..."
                )
                await asyncio.sleep(0.5)

            blobs = list(self.client.list_blobs(self.bucket_name, prefix=prefix))
            total = len([b for b in blobs if b.name.endswith(".json")])
            
            if status_callback:
                status_callback(
                    total_files=total,
                    stage_progress=1.0,
                    status_message=f"Discovered {total} objects in GCS."
                )

            # 2. Classification Phase
            if status_callback:
                status_callback(
                    current_stage=PipelineStage.CLASSIFICATION,
                    stage_progress=0.0,
                    status_message="Analyzing GCS object schemas..."
                )
                await asyncio.sleep(0.5)

            processed = 0
            for blob in blobs:
                if not blob.name.endswith(".json"):
                    continue
                
                # Download to memory for classification
                content = blob.download_as_bytes()
                detected_type, confidence = self.classifier.classify(content=content)
                
                discovery = FileDiscovery(
                    folder_path=str(Path(blob.name).parent),
                    file_name=Path(blob.name).name,
                    detected_type=detected_type,
                    status="discovered",
                    confidence_score=confidence
                )
                discovered_files.append(discovery)
                processed += 1
                
                if status_callback and processed % 5 == 0:
                    status_callback(
                        stage_progress=(processed / total) if total > 0 else 1.0,
                        status_message=f"Classifying: {Path(blob.name).name}"
                    )
                    await asyncio.sleep(0.1)
                
        except Exception as e:
            logger.error(f"GCS Scan failed: {e}")
            
        logger.info(f"GCS Scan complete. Found {len(discovered_files)} files.")
        if status_callback:
            status_callback(
                stage_progress=1.0,
                status_message="GCS Classification complete."
            )
        return discovered_files

    def get_content(self, discovery: FileDiscovery) -> bytes:
        """Fetch content from GCS blob."""
        blob_path = str(Path(discovery.folder_path) / discovery.file_name)
        # Handle case where folder_path is '.'
        if discovery.folder_path == ".":
            blob_path = discovery.file_name
            
        blob = self.bucket.blob(blob_path)
        return blob.download_as_bytes()
