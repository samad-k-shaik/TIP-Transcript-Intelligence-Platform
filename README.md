# Transcript Intelligence Platform (Phase 1)

## Overview
The Transcript Intelligence Platform is an enterprise-grade ingestion and harmonization engine designed to process fragmented transcript datasets. It recursively scans directories, dynamically classifies schemas, resolves speaker identities, and generates analytics-ready Parquet datasets.

## Key Features
- **Recursive Discovery**: Unlimited folder depth scanning.
- **Dynamic Classification**: Key-based schema detection with confidence scoring.
- **Schema Drift Handling**: Graceful handling of missing fields, malformed JSON, and renamed keys.
- **Anomaly Logging**: Structured logging of errors without stopping execution.
- **Speaker Resolution**: Mapping of speaker IDs to names across different structures.
- **Parquet Generation**: Optimized output for downstream analytics.

## Project Structure
```
backend/
├── api/             # FastAPI routes and application logic
├── ingestion/       # Core processing engine (Scanner, Classifier, etc.)
├── models/          # Pydantic data models
├── utils/           # Shared utilities (Logger, JSON, File)
├── datasets/        # Input data directory
├── logs/            # Application and anomaly logs
└── parquet/         # Generated Parquet datasets
```

## Getting Started

### Prerequisites
- Python 3.11+
- Docker & Docker Compose (optional)

### Installation
1. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Run the application:
   ```bash
   python -m backend.main
   ```

### Using Docker
```bash
docker-compose up --build
```

## API Documentation
The API documentation is available at `http://localhost:8000/docs` (Swagger UI).

### Endpoints
- `POST /api/v1/ingest`: Trigger the ingestion pipeline.
- `GET /api/v1/status`: Check ingestion status.
- `GET /api/v1/anomalies`: Retrieve recent anomalies.
- `GET /api/v1/health`: Health check.

## Ingestion Workflow
1. **Scan**: Discovers all JSON files in the `datasets/` directory.
2. **Classify**: Determines if a file is a transcript, metadata, or speaker mapping.
3. **Resolve**: Loads speaker mapping files to link IDs to names.
4. **Harmonize**: Transforms various JSON structures into a unified schema.
5. **Output**: Saves the results as Parquet files in the `parquet/` directory.

## Future Enhancements (Phase 2+)
- Integration with Google Cloud Storage.
- LLM-based summarization and sentiment analysis.
- Advanced speaker diarization verification.
- Real-time ingestion via Webhooks/Kafka.
