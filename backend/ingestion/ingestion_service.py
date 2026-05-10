import asyncio
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

from .scanner import Scanner
from .harmonizer import Harmonizer
from .resolver import Resolver
from .parquet_writer import ParquetWriter
from ..utils.logger import logger
from ..utils.json_utils import load_json
from ..models.schema_models import IngestionStatus, SchemaType

class IngestionService:
    """Orchestration service for the ingestion pipeline."""

    def __init__(self, root_dir: str):
        self.root_dir = root_dir
        self.scanner = Scanner(root_dir)
        self.harmonizer = Harmonizer()
        self.resolver = Resolver()
        self.writer = ParquetWriter()
        self.status = IngestionStatus()

    async def run_pipeline(self) -> IngestionStatus:
        """Runs the full ingestion and harmonization pipeline."""
        self.status.is_running = True
        self.status.processed_files = 0
        self.status.errors = 0
        
        try:
            # 1. Discover and Classify
            discovered = self.scanner.scan()
            self.status.total_files = len(discovered)
            
            all_utterances = []
            all_metadata = []
            
            # Group files by call_id (folder name usually)
            groups: Dict[str, List[Any]] = {}
            for discovery in discovered:
                call_id = Path(discovery.folder_path).name
                if call_id not in groups:
                    groups[call_id] = []
                groups[call_id].append(discovery)
            
            # 2. Process each group
            for call_id, files in groups.items():
                logger.info(f"Processing call_id: {call_id}")
                
                # Load mappings first
                for f in files:
                    if f.detected_type == SchemaType.SPEAKER_MAPPING:
                        try:
                            data = load_json(Path(f.folder_path) / f.file_name)
                            self.resolver.load_mappings(call_id, data)
                        except Exception as e:
                            logger.warning(f"Anomaly: Failed to load mapping for {call_id}: {e}")
                            self.status.errors += 1
                
                # Harmonize transcripts
                for f in files:
                    if f.detected_type == SchemaType.TRANSCRIPT:
                        try:
                            path = Path(f.folder_path) / f.file_name
                            data = load_json(str(path))
                            utterances = self.harmonizer.harmonize(data, call_id, f.file_name)
                            all_utterances.extend(utterances)
                            self.status.processed_files += 1
                        except Exception as e:
                            logger.error(f"Anomaly: Critical failure harmonizing {f.file_name}: {e}")
                            self.status.errors += 1
                
                # Collect metadata (Optional for now)
                # ...
                
            # 3. Resolve Speakers
            logger.info("Resolving speaker identities...")
            resolved_utterances = self.resolver.resolve(all_utterances)
            
            # 4. Generate Parquet
            logger.info("Generating Parquet datasets...")
            self.writer.write_conversations(resolved_utterances)
            self.writer.write_anomalies()
            
            self.status.last_run = datetime.now().isoformat()
            logger.info("Pipeline execution complete.")
            
        except Exception as e:
            logger.critical(f"Pipeline crashed: {e}")
            self.status.errors += 1
        finally:
            self.status.is_running = False
            
        return self.status
