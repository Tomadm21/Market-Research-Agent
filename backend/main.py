import uvicorn
import logging
from config import Config
from app import app

logger = logging.getLogger("market_analyst_agent")

if __name__ == "__main__":
    logger.info("🚀 Starting Market Analyst Agent Server")
    logger.info(f"Environment: {Config.ENVIRONMENT}")
    logger.info(f"Port: {Config.PORT}")
    
    uvicorn.run("app:app", host="0.0.0.0", port=Config.PORT, reload=Config.is_development())
