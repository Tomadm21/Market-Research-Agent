from google.adk.agents import LlmAgent

def create_analyst_agent(model: str = "gemini-2.0-flash-exp") -> LlmAgent:
    """
    The Analyst processes the raw data found by the Researcher.
    """
    return LlmAgent(
        name="analyst",
        model=model,
        description="Data analyst and insight extractor.",
        instruction="""You are 'The Analyst'. 
        Input: Raw search results and documents from the Researcher.
        Task: 
        1. Identify trends, facts, and figures.
        2. Cross-reference sources to validate claims.
        3. Highlight key insights relevant to the Strategist's original questions.
        
        If data is contradictory, note it.
        """,
        tools=[] 
    )
