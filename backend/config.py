"""
Configuration module for Google ADK Multi-Agent System.
Centralized configuration management with environment variable validation.
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""

    # Google AI Configuration
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    # Server Configuration
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000"
    ).split(",")

    # Allowed HTTP methods for CORS (restricted for security)
    ALLOWED_METHODS: List[str] = ["GET", "POST", "OPTIONS"]

    # Allowed headers for CORS (restricted for security)
    ALLOWED_HEADERS: List[str] = [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin"
    ]

    # Search API Configuration
    BRAVE_SEARCH_API_KEY: str = os.getenv("BRAVE_SEARCH_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    @classmethod
    def validate(cls) -> None:
        """
        Validate required configuration values.

        Raises:
            ValueError: If required configuration is missing.
        """
        errors = []

        if not cls.GOOGLE_API_KEY or cls.GOOGLE_API_KEY == "YOUR_NEW_GOOGLE_API_KEY_HERE":
            errors.append(
                "GOOGLE_API_KEY is not set or still has placeholder value. "
                "Please set a valid API key in your .env file."
            )

        if not cls.ALLOWED_ORIGINS:
            errors.append("ALLOWED_ORIGINS is not set. CORS will not work properly.")

        if cls.ENVIRONMENT not in ["development", "staging", "production"]:
            print(f"Warning: ENVIRONMENT '{cls.ENVIRONMENT}' is not standard. "
                  f"Expected: development, staging, or production")

        if errors:
            error_message = "\n".join(f"  - {error}" for error in errors)
            raise ValueError(
                f"Configuration validation failed:\n{error_message}\n\n"
                f"Please check your .env file and ensure all required variables are set."
            )

    @classmethod
    def is_development(cls) -> bool:
        """Check if running in development mode."""
        return cls.ENVIRONMENT == "development"

    @classmethod
    def is_production(cls) -> bool:
        """Check if running in production mode."""
        return cls.ENVIRONMENT == "production"

    @classmethod
    def get_cors_config(cls) -> dict:
        """
        Get CORS configuration dictionary.
        """
        return {
            "allow_origins": cls.ALLOWED_ORIGINS,
            "allow_credentials": True,
            "allow_methods": cls.ALLOWED_METHODS,
            "allow_headers": cls.ALLOWED_HEADERS,
        }

# Internal initialization check
if not Config.GOOGLE_API_KEY:
    import logging
    logging.getLogger("market_analyst_agent").warning("GOOGLE_API_KEY not set in environment.")

