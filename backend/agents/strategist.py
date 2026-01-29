from google.adk.agents import LlmAgent

def create_strategist_agent(model: str = "gemini-2.0-flash-exp") -> LlmAgent:
    """
    The Strategist analyzes the research topic and breaks it down into actionable sub-questions.
    """
    return LlmAgent(
        name="strategist",
        model=model,
        description="Strategic planner for market research.",
        instruction="""You are 'The Strategist', the lead planner of a market intelligence team.
        Your goal is to take a broad user topic and break it down into 3-5 specific, researchable sub-questions.
        
        Output format:
        1. Context analysis (brief)
        2. List of key questions to answer.
        3. Recommended data sources (broadly).
        """,
        tools=[] 
    )
