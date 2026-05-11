from abc import ABC, abstractmethod
from typing import List
from ..models.schema_models import FileDiscovery

class BaseScanner(ABC):
    """Abstract base class for scanning engines."""
    
    @abstractmethod
    async def scan(self, path: str = None, status_callback=None) -> List[FileDiscovery]:
        """Scans the storage backend and returns discovered files."""
        pass

    @abstractmethod
    def get_content(self, discovery: FileDiscovery) -> bytes:
        """Fetch the content of a discovered file as bytes."""
        pass
