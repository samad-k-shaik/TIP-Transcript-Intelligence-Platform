import polars as pl
from pathlib import Path
from typing import List, Any
from ..utils.logger import logger

class ParquetWriter:
    """Generates analytics-ready Parquet datasets."""

    def __init__(self, output_dir: str = "parquet"):
        self.output_path = Path(output_dir)
        self.output_path.mkdir(parents=True, exist_ok=True)

    def write_conversations(self, data: List[Any], filename: str = "conversations.parquet") -> None:
        """Writes list of utterances to Parquet."""
        if not data:
            logger.warning("No conversation data to write.")
            return

        try:
            # Convert list of Pydantic models to list of dicts
            dicts = [item.model_dump() for item in data]
            df = pl.DataFrame(dicts)
            
            target = self.output_path / filename
            df.write_parquet(target)
            logger.info(f"Successfully wrote {len(data)} records to {target}")
        except Exception as e:
            logger.error(f"Failed to write Parquet {filename}: {e}")

    def write_metadata(self, data: List[Any], filename: str = "metadata.parquet") -> None:
        """Writes metadata to Parquet."""
        if not data:
            return
        
        try:
            dicts = [item.model_dump() for item in data]
            df = pl.DataFrame(dicts)
            target = self.output_path / filename
            df.write_parquet(target)
            logger.info(f"Successfully wrote metadata to {target}")
        except Exception as e:
            logger.error(f"Failed to write metadata Parquet: {e}")
            
    def write_anomalies(self, log_path: str = "logs/anomalies.log", filename: str = "anomalies.parquet") -> None:
        """Converts anomaly logs to Parquet for analytics."""
        path = Path(log_path)
        if not path.exists():
            return
            
        try:
            # Simple log parsing for demo purposes
            with open(path, "r") as f:
                lines = f.readlines()
            
            parsed = []
            for line in lines:
                parts = line.split("|")
                if len(parts) >= 4:
                    parsed.append({
                        "timestamp": parts[0].strip(),
                        "level": parts[1].strip(),
                        "module": parts[2].strip(),
                        "message": parts[3].strip()
                    })
            
            if parsed:
                df = pl.DataFrame(parsed)
                df.write_parquet(self.output_path / filename)
        except Exception as e:
            logger.error(f"Failed to convert anomalies to Parquet: {e}")
