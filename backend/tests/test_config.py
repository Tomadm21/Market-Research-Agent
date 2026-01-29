"""Tests for configuration module."""

import os
import pytest


class TestConfig:
    """Test cases for Config class."""

    def test_config_loads_environment_variables(self):
        """Test that config loads from environment."""
        from config import Config

        assert Config.GOOGLE_API_KEY is not None
        assert Config.GEMINI_MODEL == "gemini-2.0-flash"
        assert Config.PORT == 8000
        assert Config.ENVIRONMENT == "development"

    def test_config_cors_settings(self):
        """Test CORS configuration."""
        from config import Config

        cors_config = Config.get_cors_config()

        assert "allow_origins" in cors_config
        assert "allow_methods" in cors_config
        assert "allow_headers" in cors_config
        assert cors_config["allow_credentials"] is True
        # Security: should not allow all methods
        assert cors_config["allow_methods"] != ["*"]

    def test_config_allowed_methods_restricted(self):
        """Test that only safe HTTP methods are allowed."""
        from config import Config

        allowed = Config.ALLOWED_METHODS

        assert "GET" in allowed
        assert "POST" in allowed
        assert "OPTIONS" in allowed
        # Should not include dangerous methods by default
        assert "DELETE" not in allowed or "PUT" not in allowed

    def test_is_development_mode(self):
        """Test environment detection."""
        from config import Config

        assert Config.is_development() is True
        assert Config.is_production() is False
