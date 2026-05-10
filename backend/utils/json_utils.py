import orjson
from typing import Any, Dict

def load_json(file_path: str) -> Dict[str, Any]:
    """Loads JSON file using orjson for high performance."""
    with open(file_path, "rb") as f:
        return orjson.loads(f.read())

def save_json(file_path: str, data: Any) -> None:
    """Saves data to JSON file using orjson."""
    with open(file_path, "wb") as f:
        f.write(orjson.dumps(data, option=orjson.OPT_INDENT_2))
