"""Tests for API endpoints."""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Test cases for health check endpoints."""

    def test_health_returns_status(self):
        """Test that health endpoint returns status."""
        # Import after environment is set
        from app import app

        with patch("app.get_gemini_client") as mock_client:
            mock_client.return_value = MagicMock()

            client = TestClient(app)
            response = client.get("/health")

            assert response.status_code == 200
            data = response.json()
            assert "status" in data
            assert data["status"] == "healthy"

    def test_health_ready_endpoint(self):
        """Test health/ready endpoint."""
        from app import app

        with patch("app.get_gemini_client") as mock_client:
            mock_client.return_value = MagicMock()

            client = TestClient(app)
            response = client.get("/health/ready")

            assert response.status_code == 200


class TestRootEndpoint:
    """Test cases for root endpoint."""

    def test_root_returns_service_info(self):
        """Test that root endpoint returns service information."""
        from app import app

        client = TestClient(app)
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "version" in data
        assert "endpoints" in data


class TestResearchEndpoint:
    """Test cases for research endpoint."""

    def test_research_empty_topic_returns_400(self):
        """Test that empty topic returns 400 error."""
        from app import app

        client = TestClient(app)
        response = client.post("/research", json={"topic": ""})

        assert response.status_code == 400

    def test_research_long_topic_returns_400(self):
        """Test that overly long topic returns 400 error."""
        from app import app

        client = TestClient(app)
        long_topic = "x" * 501  # Over 500 char limit
        response = client.post("/research", json={"topic": long_topic})

        assert response.status_code == 400

    def test_research_valid_topic_returns_stream(self):
        """Test that valid topic returns SSE stream."""
        from app import app

        with patch("core.orchestrator.perform_market_research_stream") as mock_stream:
            # Mock the async generator
            async def mock_generator():
                yield "event: state\ndata: {}\n\n"

            mock_stream.return_value = mock_generator()

            client = TestClient(app)
            response = client.post(
                "/research",
                json={"topic": "test topic"}
            )

            assert response.status_code == 200
            assert "text/event-stream" in response.headers.get("content-type", "")
