import asyncio
from typing import List
from pathlib import Path
from .base_scanner import BaseScanner
from .classifier import Classifier
from ..models.schema_models import FileDiscovery, SchemaType, PipelineStage
from ..utils.logger import logger

class LocalScanner(BaseScanner):
    """Recursive directory scanning engine for local files."""
    
    def __init__(self, root_dir: str):
        self.root_path = Path(root_dir)
        self.classifier = Classifier()

    async def scan(self, path: str = None, status_callback=None) -> List[FileDiscovery]:
        """Scans the directory and classifies all JSON files."""
        scan_path = Path(path) if path else self.root_path
        discovered_files = []
        logger.info(f"Starting scan of directory: {scan_path}")
        
        if not scan_path.exists():
            logger.error(f"Directory does not exist: {scan_path}")
            return []

        # 1. Discovery Phase
        if status_callback:
            status_callback(
                current_stage=PipelineStage.DISCOVERY,
                stage_progress=0.1,
                status_message=f"Scanning {scan_path.name} for JSON transcripts..."
            )
            await asyncio.sleep(0.5) # Allow UI to catch discovery start

        all_json_files = list(scan_path.rglob("*.json"))
        total = len(all_json_files)
        
        if status_callback:
            status_callback(
                total_files=total, 
                stage_progress=1.0,
                status_message=f"Discovered {total} potential transcripts."
            )

        # 2. Classification Phase
        if status_callback:
            status_callback(
                current_stage=PipelineStage.CLASSIFICATION,
                stage_progress=0.0,
                status_message="Analyzing file schemas..."
            )
            await asyncio.sleep(0.5) # Allow UI to catch classification start

        for i, json_file in enumerate(all_json_files):
            try:
                # Classify by reading file
                with open(json_file, "rb") as f:
                    content = f.read()
                detected_type, confidence = self.classifier.classify(content=content)
                
                discovery = FileDiscovery(
                    folder_path=str(json_file.parent),
                    file_name=json_file.name,
                    detected_type=detected_type,
                    status="discovered",
                    confidence_score=confidence
                )
                discovered_files.append(discovery)
                
                if status_callback and i % 5 == 0:
                    status_callback(
                        stage_progress=(i / total),
                        status_message=f"Classifying: {json_file.name}"
                    )
                    await asyncio.sleep(0.1) # Yield for UI responsiveness
                
            except Exception as e:
                logger.warning(f"Failed to process file {json_file}: {e}")
                
        logger.info(f"Scan complete. Found {len(discovered_files)} files.")
        if status_callback:
            status_callback(
                stage_progress=1.0,
                status_message="Classification complete."
            )
        return discovered_files

    def get_content(self, discovery: FileDiscovery) -> bytes:
        """Fetch content from local file."""
        full_path = Path(discovery.folder_path) / discovery.file_name
        with open(full_path, "rb") as f:
            return f.read()
