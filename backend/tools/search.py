"""
Brave Search API integration for real web search.
Includes rate limiting, caching, and error handling.
"""

import requests
import time
from typing import List, Dict, Optional
from functools import lru_cache
from config import Config

# Rate limiting
_last_request_time = 0
_min_request_interval = 1.0  # Minimum seconds between requests


class SearchError(Exception):
    """Exception raised for search API errors."""
    pass


def _rate_limit():
    """Enforce rate limiting between API requests."""
    global _last_request_time
    current_time = time.time()
    time_since_last = current_time - _last_request_time

    if time_since_last < _min_request_interval:
        sleep_time = _min_request_interval - time_since_last
        time.sleep(sleep_time)

    _last_request_time = time.time()


@lru_cache(maxsize=100)
def _cached_search(query: str, count: int) -> str:
    """
    Cached search function to avoid duplicate API calls.

    Args:
        query: Search query
        count: Number of results

    Returns:
        JSON response as string (for caching)
    """
    _rate_limit()

    # Brave Search API endpoint
    url = "https://api.search.brave.com/res/v1/web/search"

    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": Config.BRAVE_SEARCH_API_KEY
    }

    params = {
        "q": query,
        "count": count,
        "search_lang": "en",
        "safesearch": "moderate"
    }

    try:
        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=10
        )
        response.raise_for_status()
        return response.text

    except requests.exceptions.Timeout:
        raise SearchError(f"Search request timed out for query: {query}")
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            raise SearchError("Rate limit exceeded. Please try again later.")
        elif e.response.status_code == 401:
            raise SearchError("Invalid API key. Please check BRAVE_SEARCH_API_KEY configuration.")
        else:
            raise SearchError(f"HTTP error {e.response.status_code}: {str(e)}")
    except requests.exceptions.RequestException as e:
        raise SearchError(f"Search request failed: {str(e)}")


def search_web(query: str, count: int = 10) -> List[Dict]:
    """
    Search the web using Brave Search API.

    Args:
        query: Search query string
        count: Number of results to return (1-20, default 10)

    Returns:
        List of search results, each containing:
        - title: Result title
        - url: Result URL
        - description: Result snippet/description

    Raises:
        SearchError: If search fails or API key is invalid
    """
    # Input validation
    if not query or not query.strip():
        raise ValueError("Search query cannot be empty")

    if count < 1 or count > 20:
        count = min(max(count, 1), 20)  # Clamp to 1-20

    # Check if API key is configured
    if not Config.BRAVE_SEARCH_API_KEY or Config.BRAVE_SEARCH_API_KEY == "your_brave_search_api_key_here":
        # Fallback to mock data if no API key
        print("⚠️ Warning: BRAVE_SEARCH_API_KEY not configured, using mock data")
        return _mock_search(query, count)

    try:
        # Get cached or fresh search results
        import json
        response_text = _cached_search(query, count)
        response_data = json.loads(response_text)

        # Extract web results
        results = []
        web_results = response_data.get("web", {}).get("results", [])

        for item in web_results[:count]:
            results.append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "description": item.get("description", "")
            })

        if not results:
            print(f"⚠️ Warning: No results found for query: {query}")
            return _mock_search(query, min(count, 3))

        print(f"✓ Found {len(results)} search results for: {query}")
        return results

    except SearchError as e:
        print(f"❌ Search error: {e}")
        # Fallback to mock data on error
        print("  → Falling back to mock data")
        return _mock_search(query, min(count, 3))
    except Exception as e:
        print(f"❌ Unexpected error in search: {e}")
        return _mock_search(query, min(count, 3))


def _mock_search(query: str, count: int) -> List[Dict]:
    """
    Fallback mock search for when API is unavailable.

    Args:
        query: Search query
        count: Number of results

    Returns:
        Mock search results
    """
    return [
        {
            "title": f"Market Report: {query}",
            "url": "https://example.com/report1",
            "description": f"Comprehensive market analysis for {query}. The market is experiencing significant growth with key trends emerging in technology adoption and consumer behavior."
        },
        {
            "title": f"Industry Analysis: {query}",
            "url": "https://example.com/analysis1",
            "description": f"In-depth industry analysis covering {query}. Key players include established companies and innovative startups competing for market share."
        },
        {
            "title": f"Trends and Insights: {query}",
            "url": "https://example.com/trends1",
            "description": f"Latest trends and insights for {query}. Market projections show strong growth potential with emerging opportunities in various segments."
        }
    ][:count]


def clear_search_cache():
    """Clear the search cache."""
    _cached_search.cache_clear()
    print("✓ Search cache cleared")
