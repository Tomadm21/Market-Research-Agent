from prometheus_client import Counter, Gauge, Histogram

# --- Prometheus Metrics ---
ACTIVE_REQUESTS = Gauge("active_research_requests", "Number of active research sessions")
REPORTS_COMPLETED = Counter("research_reports_completed_total", "Total reports generated")
RESEARCH_DURATION = Histogram(
    "research_duration_seconds", 
    "Time taken for full research pipeline", 
    buckets=[10, 30, 60, 120, 300]
)
REQUESTS_TOTAL = Counter("research_requests_total", "Total requests received", ["status"])

# Role specific timing
AGENT_STEP_DURATION = Histogram("agent_step_duration_seconds", "Time spent in each agent role", ["role"])

# External API Latency
BRAVE_SEARCH_LATENCY = Histogram("brave_search_latency_bucket", "Latency of Brave Search API calls")
LLM_TOKENS = Counter("llm_tokens_total", "Total LLM tokens used", ["model"])

# System Health
ACTIVE_SSE = Gauge("active_sse_connections", "Number of active SSE streams")
SSE_DISCONNECTS = Counter("sse_disconnects_total", "Total SSE disconnections")
