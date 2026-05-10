from pathlib import Path
from typing import List

def get_all_files(root_dir: str, pattern: str = "**/*.json") -> List[Path]:
    """Recursively finds all files matching the pattern."""
    return list(Path(root_dir).rglob(pattern))

def ensure_dir(dir_path: str) -> Path:
    """Ensures a directory exists."""
    path = Path(dir_path)
    path.mkdir(parents=True, exist_ok=True)
    return path
