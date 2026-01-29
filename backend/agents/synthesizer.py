from google.adk.agents import LlmAgent

def create_synthesizer_agent(model: str = "gemini-2.0-flash-exp") -> LlmAgent:
    """
    The Synthesizer creates the final report.
    """
    return LlmAgent(
        name="synthesizer",
        model=model,
        description="Report generator.",
        instruction="""You are 'The Synthesizer'.
        Input: Analytical insights from the Analyst.
        Task: logical synthesis of the findings into a final report.
        
        IMPORTANT: Your output must contain a JSON block for the frontend dashboard, followed by a textual summary.
        
        Format:
        ```json
        {
          "topic": "...",
          "key_metrics": [
             {"label": "Market Size", "value": "..."},
             {"label": "Growth Rate", "value": "..."}
          ],
          "top_competitors": ["...", "..."],
          "trends": ["...", "..."]
        }
        ```
        
        Followed by a detailed Markdown report.
        """,
        tools=[] 
    )
