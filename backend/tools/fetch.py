"""
Document fetching and content extraction.
Downloads web pages and extracts main content using BeautifulSoup.
"""

import requests
from bs4 import BeautifulSoup
from typing import Optional
from urllib.parse import urlparse


class FetchError(Exception):
    """Exception raised for document fetching errors."""
    pass


def fetch_document(url: str, max_size_kb: int = 500) -> str:
    """
    Fetch and extract main content from a URL.

    Args:
        url: URL to fetch
        max_size_kb: Maximum document size in KB (default 500KB)

    Returns:
        Extracted text content from the page

    Raises:
        FetchError: If fetching fails or URL is invalid
    """
    # Input validation
    if not url or not url.strip():
        raise ValueError("URL cannot be empty")

    # Validate URL format
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError(f"Invalid URL format: {url}")
    except Exception as e:
        raise ValueError(f"Invalid URL: {str(e)}")

    # Check for safe protocols
    if parsed.scheme not in ['http', 'https']:
        raise ValueError(f"Unsupported URL scheme: {parsed.scheme}. Only http/https allowed.")

    try:
        # Set headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }

        # Fetch with streaming to check size
        response = requests.get(
            url,
            headers=headers,
            timeout=10,
            stream=True,
            allow_redirects=True
        )
        response.raise_for_status()

        # Check content size
        content_length = response.headers.get('content-length')
        if content_length and int(content_length) > max_size_kb * 1024:
            raise FetchError(f"Document too large: {int(content_length) / 1024:.1f}KB (max {max_size_kb}KB)")

        # Download content
        content = b''
        max_bytes = max_size_kb * 1024
        for chunk in response.iter_content(chunk_size=8192):
            content += chunk
            if len(content) > max_bytes:
                raise FetchError(f"Document exceeded size limit while downloading (max {max_size_kb}KB)")

        # Check content type
        content_type = response.headers.get('content-type', '')
        if 'text/html' not in content_type.lower():
            # For non-HTML content, return limited info
            return f"Document at {url} (Content-Type: {content_type})\nNote: Non-HTML content. Size: {len(content)} bytes."

        # Parse HTML
        soup = BeautifulSoup(content, 'html.parser')

        # Remove script and style elements
        for script in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            script.decompose()

        # Extract text from main content areas (prioritize)
        main_content = None
        for selector in ['main', 'article', '[role="main"]', '.content', '#content', '.post', '.entry-content']:
            main_content = soup.select_one(selector)
            if main_content:
                break

        if main_content:
            text = main_content.get_text(separator='\n', strip=True)
        else:
            # Fallback to body
            text = soup.get_text(separator='\n', strip=True)

        # Clean up text
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        text = '\n'.join(lines)

        # Limit text length (max ~10KB)
        max_chars = 10000
        if len(text) > max_chars:
            text = text[:max_chars] + f"\n\n[Content truncated. Full document: {len(text)} characters]"

        if not text or len(text) < 50:
            return f"Document at {url}\nNote: Minimal content extracted. The page may be JavaScript-heavy or have restricted access."

        print(f"✓ Fetched document from {url} ({len(text)} characters)")
        return f"Document from: {url}\n\n{text}"

    except requests.exceptions.Timeout:
        raise FetchError(f"Request timed out for URL: {url}")
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            raise FetchError(f"Document not found (404): {url}")
        elif e.response.status_code == 403:
            raise FetchError(f"Access forbidden (403): {url}")
        elif e.response.status_code == 429:
            raise FetchError(f"Rate limited (429): {url}")
        else:
            raise FetchError(f"HTTP error {e.response.status_code}: {url}")
    except requests.exceptions.SSLError:
        raise FetchError(f"SSL certificate error for URL: {url}")
    except requests.exceptions.RequestException as e:
        raise FetchError(f"Request failed for {url}: {str(e)}")
    except Exception as e:
        raise FetchError(f"Unexpected error fetching {url}: {str(e)}")


def fetch_multiple_documents(urls: list, max_size_kb: int = 500) -> dict:
    """
    Fetch multiple documents.

    Args:
        urls: List of URLs to fetch
        max_size_kb: Maximum size per document

    Returns:
        Dictionary mapping URLs to their content or error messages
    """
    results = {}

    for url in urls:
        try:
            content = fetch_document(url, max_size_kb)
            results[url] = {
                "success": True,
                "content": content
            }
        except (FetchError, ValueError) as e:
            results[url] = {
                "success": False,
                "error": str(e)
            }
            print(f"❌ Failed to fetch {url}: {e}")

    return results
