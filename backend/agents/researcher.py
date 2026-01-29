from google.adk.agents import LlmAgent
from typing import List, Dict

# Mock Tool
def search_web(query: str) -> List[Dict]:
    """
    Searches the web for information (Mock implementation).
    """
    # In a real app, use Tavily or Serper here.
    return [
        {"title": f"Market Report: {query}", "snippet": f"The market for {query} is growing by 15% CAGR...", "url": "example.com/report1"},
        {"title": f"News about {query}", "snippet": f"Key players in {query} include Company A and Company B.", "url": "example.com/news1"}
    ]

def fetch_document(url: str) -> str:
    """
    Fetches document content from a URL (Mock implementation).
    """
    return f"Content of document at {url}..."

def create_researcher_agent(model: str = "gemini-2.0-flash-exp") -> LlmAgent:
    """
    The Researcher collects raw data from the web and documents.
    """
    return LlmAgent(
        name="researcher",
        model=model,
        description="Data collector for market research.",
        instruction="""You are 'The Researcher'.
        Your job is to use the search tools to find concrete data answering the Strategist's questions.
        For each question, run specific queries and collect relevant snippets.
        """,
        tools=[search_web, fetch_document]
    )
