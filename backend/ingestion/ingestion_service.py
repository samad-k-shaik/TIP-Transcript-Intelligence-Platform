import os
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime
from .local_scanner import LocalScanner
from .gcs_scanner import GCSScanner
from .harmonizer import Harmonizer
from .resolver import Resolver
from .parquet_writer import ParquetWriter
from ..services.ai_service import AIService
from ..utils.logger import logger
from ..utils.json_utils import load_json
from ..models.schema_models import IngestionStatus, SchemaType, PipelineStage, FileOutcome
from ..models.transcript_models import TranscriptUtterance, CallMetadata

class IngestionService:
    """Orchestration service for the ingestion pipeline."""

    def __init__(self, root_dir: str = None, storage_type: str = "local"):
        self.storage_type = os.getenv("STORAGE_TYPE", storage_type)
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.bucket_name = os.getenv("GCS_BUCKET_NAME")
        
        # Factory for Scanners
        if self.storage_type == "gcs":
            self.scanner = GCSScanner(self.bucket_name, self.project_id)
        else:
            self.scanner = LocalScanner(root_dir or "datasets")
            
        self.harmonizer = Harmonizer()
        self.resolver = Resolver()
        self.writer = ParquetWriter()
        self.ai_service = AIService(self.project_id) if self.project_id else None
        self.status = IngestionStatus()

    async def run_pipeline(self, dataset_name: str = None) -> IngestionStatus:
        """Runs the full ingestion and harmonization pipeline."""
        ds_label = dataset_name or "default"
        self.status.is_running = True
        self.status.processed_files = 0
        self.status.ai_analyzed = 0
        self.status.errors = 0
        self.status.current_stage = PipelineStage.DISCOVERY
        self.status.stage_progress = 0.0
        self.status.status_message = "Initializing Intelligence Pipeline..."
        self.status.outcomes = []
        
        def update_status(**kwargs):
            for key, value in kwargs.items():
                if hasattr(self.status, key):
                    setattr(self.status, key, value)
            logger.debug(f"Pipeline Status Update: {kwargs}")

        try:
            # 1. Discover and Classify
            logger.info("Stage: Discovery & Classification")
            await asyncio.sleep(1.5) # Wait for Raw Dataset node to finish animating
            
            # Determine scan path
            scan_path = None
            if dataset_name:
                if self.storage_type == "local":
                    scan_path = str(Path("datasets") / dataset_name)
                    if not Path(scan_path).exists() and Path("datasets_tip").exists():
                        scan_path = str(Path("datasets_tip") / dataset_name)
                else:
                    scan_path = f"datasets_tip/{dataset_name}/"
            else:
                if self.storage_type == "local":
                    scan_path = "datasets"
                    if not Path(scan_path).exists() and Path("datasets_tip").exists():
                        scan_path = "datasets_tip"
                else:
                    scan_path = "datasets_tip/"
            
            # Pass callback to scanner for real-time DISCOVERY -> CLASSIFICATION updates
            discovered = await self.scanner.scan(path=scan_path, status_callback=update_status)
            self.status.total_files = len(discovered)
            
            # Record initial outcomes as discovered
            for f in discovered:
                call_id = Path(f.folder_path).name
                self.status.outcomes.append(FileOutcome(
                    file_name=f.file_name,
                    call_id=call_id,
                    type=f.detected_type,
                    status="discovered"
                ))
            
            await asyncio.sleep(1.0)
            
            all_utterances = []
            all_metadata = []
            
            # Group files by call_id (folder name) and map call_id to its resolved dataset name
            groups: Dict[str, List[Any]] = {}
            call_datasets: Dict[str, str] = {}
            for discovery in discovered:
                call_id = Path(discovery.folder_path).name
                if call_id not in groups:
                    groups[call_id] = []
                groups[call_id].append(discovery)
                
                if call_id not in call_datasets:
                    p_parts = Path(discovery.folder_path).parts
                    resolved_ds = ds_label
                    if len(p_parts) >= 3:
                        if p_parts[0] in ("datasets_tip", "datasets"):
                            resolved_ds = p_parts[1]
                    elif len(p_parts) == 2:
                        resolved_ds = p_parts[0]
                    call_datasets[call_id] = resolved_ds
            
            # 2. Process each group (Harmonization)
            self.status.current_stage = PipelineStage.HARMONIZATION
            self.status.status_message = "Harmonizing fragmented datasets..."
            total_groups = len(groups)
            for i, (call_id, files) in enumerate(groups.items()):
                self.status.stage_progress = (i / total_groups) if total_groups > 0 else 1.0
                self.status.status_message = f"Harmonizing: {call_id}"
                logger.info(f"Processing call_id: {call_id}")
                
                # Load mappings first
                for f in files:
                    if f.detected_type == SchemaType.SPEAKER_MAPPING:
                        try:
                            content = self.scanner.get_content(f)
                            data = json.loads(content)
                            self.resolver.load_mappings(call_id, data)
                            self._update_outcome(f.file_name, call_id, "processed")
                        except Exception as e:
                            logger.warning(f"Anomaly: Failed to load mapping for {call_id}: {e}")
                            self.status.errors += 1
                            self._update_outcome(f.file_name, call_id, "error", str(e))
                
                # Load metadata
                for f in files:
                    if f.detected_type == SchemaType.METADATA:
                        try:
                            content = self.scanner.get_content(f)
                            data = json.loads(content)
                            meta = self.harmonizer.harmonize_metadata(data, call_id)
                            if meta:
                                meta.dataset = call_datasets.get(call_id, ds_label)
                                all_metadata.append(meta)
                            self._update_outcome(f.file_name, call_id, "processed")
                        except Exception as e:
                            logger.warning(f"Anomaly: Failed to load metadata for {call_id}: {e}")
                            self.status.errors += 1
                            self._update_outcome(f.file_name, call_id, "error", str(e))
 
                # Harmonize transcripts
                for f in files:
                    if f.detected_type == SchemaType.TRANSCRIPT:
                        try:
                            content = self.scanner.get_content(f)
                            utterances = self.harmonizer.harmonize_transcript(json.loads(content), call_id, f.file_name)
                            for utt in utterances:
                                utt.dataset = call_datasets.get(call_id, ds_label)
                            all_utterances.extend(utterances)
                            self.status.processed_files += 1
                            self._update_outcome(f.file_name, call_id, "harmonized")
                        except Exception as e:
                            logger.error(f"Anomaly: Critical failure harmonizing {f.file_name}: {e}")
                            self.status.errors += 1
                            self._update_outcome(f.file_name, call_id, "error", str(e))
                
                if i % 3 == 0: # More frequent delays for UI smoothness
                    await asyncio.sleep(0.3)
            
            self.status.status_message = "Harmonization complete."
            await asyncio.sleep(0.8)
                
            # 3. Resolve Speakers
            if all_utterances:
                self.status.current_stage = PipelineStage.RESOLVING
                self.status.stage_progress = 0.5
                self.status.status_message = "De-anonymizing speaker identities..."
                logger.info(f"Resolving speaker identities for {len(all_utterances)} utterances...")
                await asyncio.sleep(1.5)
                all_utterances = self.resolver.resolve(all_utterances)
                self.status.stage_progress = 1.0
                self.status.status_message = "Speaker resolution finalized."
                await asyncio.sleep(0.8)
            
            # 4. Vertex AI Enrichment (Summarization & Sentiment)
            self.status.current_stage = PipelineStage.AI_ENRICHMENT
            if self.ai_service and all_utterances:
                self.status.status_message = "Extracting deep intelligence with Gemini AI..."
                logger.info("Enriching conversations with Vertex AI...")
                # Simple logic: group by call_id and analyze
                conversation_texts: Dict[str, List[str]] = {}
                for u in all_utterances:
                    cid = u.call_id
                    if cid not in conversation_texts:
                        conversation_texts[cid] = []
                    conversation_texts[cid].append(f"{u.speaker_name or 'Unknown'}: {u.utterance}")
                
                total_conversations = len(conversation_texts)
                for i, (cid, messages) in enumerate(conversation_texts.items()):
                    self.status.stage_progress = (i / total_conversations) if total_conversations > 0 else 1.0
                    self.status.status_message = f"AI Insight Generation: {cid}"
                    full_text = "\n".join(messages)
                    insights = await self.ai_service.analyze_transcript(full_text)
                    
                    # Find matching metadata and update
                    meta_found = False
                    for meta in all_metadata:
                        if meta.call_id == cid:
                            meta.summary = insights.get("summary")
                            meta.sentiment = insights.get("sentiment")
                            meta.call_type = insights.get("call_type")
                            meta.primary_topic = insights.get("primary_topic")
                            meta.stakeholder_impact = insights.get("stakeholder_impact")
                            meta_found = True
                            break
                    
                    # Also update utterances with the AI-determined call_type
                    for utt in all_utterances:
                        if utt.call_id == cid:
                            utt.call_type = insights.get("call_type", "internal calls")
                    
                    if not meta_found:
                        # Create minimal metadata if not found
                        all_metadata.append(CallMetadata(
                            call_id=cid,
                            dataset=call_datasets.get(cid, ds_label),
                            summary=insights.get("summary", "Automated baseline summary."),
                            sentiment=insights.get("sentiment", "NEUTRAL"),
                            call_type=insights.get("call_type", "internal calls"),
                            primary_topic=insights.get("primary_topic", "General"),
                            stakeholder_impact=insights.get("stakeholder_impact", [])
                        ))
                    self.status.ai_analyzed += 1
                    # Small delay per analysis to see progress in UI
                    await asyncio.sleep(0.5)
                
            # 5. Finalizing data
            self.status.current_stage = PipelineStage.FINALIZING
            self.status.status_message = "Committing intelligence to analytical storage..."
            self.status.stage_progress = 0.5
            await asyncio.sleep(1.0)

            for meta in all_metadata:
                if not meta.sentiment:
                    meta.sentiment = "NEUTRAL"
                if not meta.summary:
                    meta.summary = "Processing complete. Deep intelligence pending AI optimization."
                if not meta.call_type:
                    meta.call_type = "internal calls"
                if not meta.primary_topic:
                    meta.primary_topic = "General"
            
            # Ensure utterances also have the correct call_type from metadata if possible
            for utt in all_utterances:
                if utt.call_type == "unknown":
                    # Match with metadata
                    for meta in all_metadata:
                        if meta.call_id == utt.call_id:
                            utt.call_type = meta.call_type
                            break
                    # Final fallback if still unknown
                    if utt.call_type == "unknown":
                        utt.call_type = "internal calls"

            # 6. Generate Parquet
            logger.info("Generating Parquet datasets...")
            self.writer.write_conversations(all_utterances, dataset_name=ds_label)
            self.writer.write_metadata(all_metadata, dataset_name=ds_label)
            self.writer.write_anomalies()
            
            self.status.last_run = datetime.now().isoformat()
            self.status.current_stage = PipelineStage.COMPLETE
            self.status.stage_progress = 1.0
            self.status.status_message = "Pipeline successfully finalized."
            logger.info(f"Pipeline execution complete. Processed {self.status.processed_files} transcripts.")
            await asyncio.sleep(2.0) # Let the user see the complete state
            
        except Exception as e:
            logger.critical(f"Pipeline crashed: {e}")
            self.status.errors += 1
            self.status.status_message = f"Pipeline Error: {str(e)}"
        finally:
            self.status.is_running = False
            if self.status.current_stage != PipelineStage.COMPLETE:
                 self.status.current_stage = PipelineStage.IDLE
            
        return self.status

    def _update_outcome(self, file_name: str, call_id: str, status: str, error_message: str = None):
        for o in self.status.outcomes:
            if o.file_name == file_name and o.call_id == call_id:
                o.status = status
                if error_message:
                    o.error_message = error_message
                break
