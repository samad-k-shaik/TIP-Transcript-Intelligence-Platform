import polars as pl
from pathlib import Path
from typing import List, Any
from ..utils.logger import logger

class ParquetWriter:
    """Generates analytics-ready Parquet datasets."""

    def __init__(self, output_dir: str = "parquet"):
        self.output_path = Path(output_dir)
        self.output_path.mkdir(parents=True, exist_ok=True)

    def write_conversations(self, data: List[Any], dataset_name: str = "default", filename: str = "conversations.parquet") -> None:
        """Writes list of utterances to Parquet, updating the specific dataset's records."""
        if not data:
            logger.warning("No conversation data to write.")
            return

        try:
            # Convert list of Pydantic models to list of dicts
            dicts = [item.model_dump() for item in data]
            df_new = pl.DataFrame(dicts)
            
            # Find unique datasets in the new data
            new_datasets = []
            if "dataset" in df_new.columns:
                new_datasets = [d for d in df_new["dataset"].drop_nulls().unique().to_list() if d]
            
            target = self.output_path / filename
            if target.exists():
                try:
                    df_existing = pl.read_parquet(target)
                    # Filter out any existing rows for these datasets
                    if "dataset" in df_existing.columns and new_datasets:
                        df_existing = df_existing.filter(~pl.col("dataset").is_in(new_datasets))
                    
                    # Ensure schema columns are identical for concatenation
                    for col in df_new.columns:
                        if col not in df_existing.columns:
                            df_existing = df_existing.with_columns(pl.lit(None).alias(col))
                    for col in df_existing.columns:
                        if col not in df_new.columns:
                            df_new = df_new.with_columns(pl.lit(None).alias(col))
                            
                    # Cast schema of df_new to match df_existing order and types
                    df_new = df_new.select(df_existing.columns)
                    df = pl.concat([df_existing, df_new])
                except Exception as ex:
                    logger.warning(f"Could not merge with existing parquet, overwriting: {ex}")
                    df = df_new
            else:
                df = df_new
                
            df.write_parquet(target)
            logger.info(f"Successfully wrote {len(data)} records to {target}")
        except Exception as e:
            logger.error(f"Failed to write Parquet {filename}: {e}")

    def write_metadata(self, data: List[Any], dataset_name: str = "default", filename: str = "metadata.parquet") -> None:
        """Writes metadata to Parquet, updating the specific dataset's records."""
        if not data:
            return
        
        try:
            dicts = [item.model_dump() for item in data]
            df_new = pl.DataFrame(dicts)
            # Find unique datasets in the new data
            new_datasets = []
            if "dataset" in df_new.columns:
                new_datasets = [d for d in df_new["dataset"].drop_nulls().unique().to_list() if d]

            target = self.output_path / filename
            if target.exists():
                try:
                    df_existing = pl.read_parquet(target)
                    if "dataset" in df_existing.columns and new_datasets:
                        df_existing = df_existing.filter(~pl.col("dataset").is_in(new_datasets))
                    
                    # Align schemas
                    for col in df_new.columns:
                        if col not in df_existing.columns:
                            df_existing = df_existing.with_columns(pl.lit(None).alias(col))
                    for col in df_existing.columns:
                        if col not in df_new.columns:
                            df_new = df_new.with_columns(pl.lit(None).alias(col))
                            
                    df_new = df_new.select(df_existing.columns)
                    df = pl.concat([df_existing, df_new])
                except Exception as ex:
                    logger.warning(f"Could not merge with existing metadata parquet, overwriting: {ex}")
                    df = df_new
            else:
                df = df_new
                
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
