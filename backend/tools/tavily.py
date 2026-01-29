
from typing import List, Dict, Any
from tavily import TavilyClient
from config import Config

def tavily_search(query: str, max_results: int = 5, depth: str = "basic") -> List[Dict[str, str]]:
    """
    Performs a deep search using Tavily API.
    
    Args:
        query: Search query
        max_results: Number of results to return
        depth: "basic" or "advanced"
        
    Returns:
        Formatted string of search results
    """
    api_key = Config.TAVILY_API_KEY
    if not api_key:
        print("Error: TAVILY_API_KEY not configured.")
        return []
        
    try:
        client = TavilyClient(api_key=api_key)
        
        # Determine search depth based on request
        search_depth = "advanced" if depth == "advanced" else "basic"
        
        response = client.search(
            query=query, 
            search_depth=search_depth, 
            max_results=max_results,
            include_answer=False # We handle separate integration if needed
        )
        
        results = []
        for result in response.get("results", []):
            results.append({
                "title": result.get("title", ""),
                "url": result.get("url", ""),
                "description": result.get("content", "")[:500] # Use content as description
            })
            
        return results
        
    except Exception as e:
        print(f"Tavily search error: {e}")
        return []
