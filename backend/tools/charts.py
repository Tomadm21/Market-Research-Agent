
import json
from llm_client import get_gemini_client

def generate_chart_data(research_data: str, topic: str) -> dict:
    """
    Analyzes research data and extracts structured JSON for frontend charts.
    Returns a dictionary containing a list of chart configurations.
    """
    client = get_gemini_client()
    
    prompt = f"""You are a Data visualization expert.
    
    Your goal is to extract key data points from the provided research text and format them into structured JSON that can be rendered by a frontend charting library.
    
    Topic: {topic}
    
    Research Data:
    {research_data}
    
    Instructions:
    1. Identify 2-3 distinct datasets suitable for visualization (e.g., "Market Growth over Time", "Competitor Market Share", "Regional Distribution").
    2. PRIORITIZE EXACT NUMBERS found in the text. Do not invent data if possible.
    3. If you MUST estimate a value to complete a trend or comparison, you MUST append "(est)" to the label (e.g., "2025 (est)").
    4. Provide a `subtitle` for each chart that explains the source context (e.g., "Source: Gartner 2024 projections mentioned in text" or "AI-Estimated breakdown based on regional context").
    
    Output Format (JSON):
    {{
      "charts": [
        {{
          "type": "line",  // or "bar", "pie", "area"
          "title": "Global Market Size (2020-2030)",
          "subtitle": "Projected growth in billions USD",
          "data": [
            {{"label": "2020", "value": 5.2}},
            {{"label": "2021", "value": 6.1}},
            ...
          ],
          "xAxisKey": "label",
          "dataKey": "value",
          "color": "#3b82f6" // Optional hex color hint
        }},
        {{
          "type": "bar",
          "title": "Top Competitors by Market Share",
          "data": [
             {{"label": "Company A", "value": 35}},
             ...
          ],
          "xAxisKey": "label",
          "dataKey": "value",
          "color": "#10b981"
        }}
      ]
    }}
    
    Return ONLY valid JSON.
    """
    
    try:
        response = client.generate(prompt, temperature=0.1)
        
        # Clean JSON
        if "```json" in response:
            json_str = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            json_str = response.split("```")[1].split("```")[0].strip()
        else:
            json_str = response.strip()
            
        data = json.loads(json_str)
        
        # Validate structure
        if "charts" not in data:
            data = {"charts": []}
            
        return data
        
    except Exception as e:
        print(f"Error generating chart data: {e}")
        # Fallback empty structure
        return {"charts": []}
