"""
Tools package for market research data collection.
"""

from .search import search_web
from .fetch import fetch_document

__all__ = ['search_web', 'fetch_document']
