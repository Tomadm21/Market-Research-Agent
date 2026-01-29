"""Tests for document fetching module."""

import pytest
from tools.fetch import fetch_document, FetchError


class TestFetchDocument:
    """Test cases for document fetching."""

    def test_fetch_empty_url_raises_error(self):
        """Test that empty URL raises ValueError."""
        with pytest.raises(ValueError, match="cannot be empty"):
            fetch_document("")

        with pytest.raises(ValueError, match="cannot be empty"):
            fetch_document("   ")

    def test_fetch_invalid_url_raises_error(self):
        """Test that invalid URL format raises ValueError."""
        with pytest.raises(ValueError, match="Invalid URL"):
            fetch_document("not-a-url")

        with pytest.raises(ValueError, match="Unsupported URL scheme"):
            fetch_document("ftp://invalid.com")

    def test_fetch_unsafe_scheme_raises_error(self):
        """Test that non-http(s) schemes are rejected."""
        with pytest.raises(ValueError, match="Invalid URL"):
            fetch_document("file:///etc/passwd")

        with pytest.raises(ValueError, match="Invalid URL"):
            fetch_document("javascript:alert(1)")

    def test_fetch_valid_url_format(self):
        """Test that valid URL formats are accepted."""
        # These will fail on network, but should pass URL validation
        with pytest.raises(FetchError):  # Network error, not ValueError
            fetch_document("https://nonexistent-domain-12345.com")
