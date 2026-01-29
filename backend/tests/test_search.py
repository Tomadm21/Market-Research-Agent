"""Tests for search module."""

import pytest
from unittest.mock import patch, MagicMock


class TestSearchWeb:
    """Test cases for web search functionality."""

    def test_search_empty_query_raises_error(self):
        """Test that empty query raises ValueError."""
        from tools.search import search_web

        with pytest.raises(ValueError, match="cannot be empty"):
            search_web("")

        with pytest.raises(ValueError, match="cannot be empty"):
            search_web("   ")

    def test_search_count_clamped(self):
        """Test that count is clamped to valid range."""
        from tools.search import search_web

        # Should not raise, count will be clamped
        # This will use mock data since API key is test key
        results = search_web("test query", count=100)
        assert len(results) <= 20

    def test_mock_search_returns_results(self):
        """Test that mock search returns valid structure."""
        from tools.search import _mock_search

        results = _mock_search("test query", 3)

        assert len(results) == 3
        for result in results:
            assert "title" in result
            assert "url" in result
            assert "description" in result

    def test_search_fallback_to_mock(self):
        """Test that search falls back to mock on API error."""
        from tools.search import search_web

        # With test API key, should use mock data
        results = search_web("test query", count=3)

        assert len(results) > 0
        assert all("title" in r for r in results)

    def test_clear_cache(self):
        """Test cache clearing."""
        from tools.search import clear_search_cache, _cached_search

        # Should not raise
        clear_search_cache()
