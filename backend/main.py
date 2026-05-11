import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as api_router
from backend.utils.logger import logger

app = FastAPI(
    title="Transcript Intelligence Platform",
    description="Enterprise-grade ingestion and harmonization engine.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Transcript Intelligence Platform API is running",
        "status": "healthy",
        "endpoints": {
            "api_v1": "/api/v1",
            "health": "/health"
        }
    }

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    logger.info("Transcript Intelligence Platform starting up...")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
