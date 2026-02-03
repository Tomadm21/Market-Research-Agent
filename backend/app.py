import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from prometheus_client import make_asgi_app

from config import Config
from core.orchestrator import perform_market_research_stream
from core.metrics import REQUESTS_TOTAL
from llm_client import get_gemini_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("market_analyst_agent")

app = FastAPI(title="Market Analyst Agent")

# Metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# CORS mapping
app.add_middleware(
    CORSMiddleware,
    **Config.get_cors_config()
)

class ResearchRequest(BaseModel):
    topic: str
    research_depth: int = 1

@app.post("/research")
async def research_topic(request: ResearchRequest):
    if not request.topic or len(request.topic.strip()) == 0:
        REQUESTS_TOTAL.labels(status="bad_request").inc()
        raise HTTPException(status_code=400, detail="Topic is required")

    return StreamingResponse(
        perform_market_research_stream(request.topic, request.research_depth),
        media_type="text/event-stream"
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": Config.GEMINI_MODEL}

@app.get("/")
async def root():
    return {"service": "Market Analyst Agent", "version": "2.0"}
