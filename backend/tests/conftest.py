"""Pytest configuration and fixtures."""

import os
import sys
import pytest
from unittest.mock import MagicMock, patch

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set test environment variables before importing modules
os.environ["GOOGLE_API_KEY"] = "test-api-key-for-testing"
os.environ["BRAVE_SEARCH_API_KEY"] = "test-brave-key"
os.environ["ENVIRONMENT"] = "development"
os.environ["GEMINI_MODEL"] = "gemini-2.0-flash"


@pytest.fixture
def mock_gemini_client():
    """Mock Gemini client for testing without API calls."""
    with patch("llm_client.client_sdk") as mock_sdk:
        mock_response = MagicMock()
        mock_response.text = "Mocked AI response for testing"
        mock_sdk.models.generate_content.return_value = mock_response
        yield mock_sdk


@pytest.fixture
def mock_brave_search():
    """Mock Brave Search API responses."""
    mock_results = [
        {
            "title": "Test Result 1",
            "url": "https://example.com/1",
            "description": "Test description 1"
        },
        {
            "title": "Test Result 2",
            "url": "https://example.com/2",
            "description": "Test description 2"
        }
    ]
    with patch("tools.search.search_web") as mock_search:
        mock_search.return_value = mock_results
        yield mock_search


@pytest.fixture
def sample_topic():
    """Sample research topic for testing."""
    return "Electric vehicles market 2024"
