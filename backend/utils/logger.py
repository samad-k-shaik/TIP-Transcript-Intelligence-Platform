import logging
import sys
from pathlib import Path

def setup_logger(name: str, log_dir: str = "logs") -> logging.Logger:
    """Sets up a structured logger for the platform."""
    Path(log_dir).mkdir(parents=True, exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s'
    )
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Main File Handler
    file_handler = logging.FileHandler(Path(log_dir) / "app.log")
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Anomaly Handler (Severity WARNING and above)
    anomaly_handler = logging.FileHandler(Path(log_dir) / "anomalies.log")
    anomaly_handler.setLevel(logging.WARNING)
    anomaly_handler.setFormatter(formatter)
    logger.addHandler(anomaly_handler)
    
    return logger

# Global instance for easy access
logger = setup_logger("transcript-intel")
