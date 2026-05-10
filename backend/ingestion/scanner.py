from pathlib import Path
from typing import List, Dict, Any
from .classifier import Classifier
from ..models.schema_models import FileDiscovery, SchemaType
from ..utils.logger import logger

class Scanner:
    """Recursive directory scanning engine."""
    
    def __init__(self, root_dir: str):
        self.root_path = Path(root_dir)
        self.classifier = Classifier()

    def scan(self) -> List[FileDiscovery]:
        """Scans the directory and classifies all JSON files."""
        discovered_files = []
        logger.info(f"Starting scan of directory: {self.root_path}")
        
        if not self.root_path.exists():
            logger.error(f"Root directory does not exist: {self.root_path}")
            return []

        for json_file in self.root_path.rglob("*.json"):
            try:
                detected_type, confidence = self.classifier.classify(json_file)
                discovery = FileDiscovery(
                    folder_path=str(json_file.parent),
                    file_name=json_file.name,
                    detected_type=detected_type,
                    status="discovered",
                    confidence_score=confidence
                )
                discovered_files.append(discovery)
                logger.debug(f"Discovered {json_file.name} as {detected_type}")
            except Exception as e:
                logger.warning(f"Failed to process file {json_file}: {e}")
                
        logger.info(f"Scan complete. Found {len(discovered_files)} files.")
        return discovered_files
