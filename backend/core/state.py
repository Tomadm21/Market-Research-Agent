import json
from typing import List, Dict, Any

class AgentState:
    """Shared state for agent execution"""
    def __init__(self):
        self.current_step: str = "idle"
        self.logs: List[str] = []
        self.sources: List[Dict[str, Any]] = []
        self.strategy: str = ""
        self.raw_data: str = ""
        self.insights: str = ""
        self.chart_data: Dict[str, Any] = {}
        self.final_report: str = ""
        self.dashboard_url: str = ""

def send_sse_update(event: str, data: Dict[str, Any]) -> str:
    """Helper to format SSE update string"""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"
