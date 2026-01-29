"""
Simplified agent server without ag-ui-adk dependency.
Uses standard REST API + Server-Sent Events for real-time updates.
"""

import os
import uvicorn
import asyncio
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, AsyncGenerator
from dotenv import load_dotenv

from config import Config
from llm_client import get_gemini_client
from tools.search import search_web
from tools.fetch import fetch_document
from tools.charts import generate_chart_data
from tools.tavily import tavily_search
from prometheus_client import make_asgi_app, Counter, Gauge, Histogram
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("market_analyst_agent")

load_dotenv()

# --- Prometheus Metrics ---
ACTIVE_REQUESTS = Gauge("active_research_requests", "Number of active research sessions")
REPORTS_COMPLETED = Counter("research_reports_completed_total", "Total reports generated")
RESEARCH_DURATION = Histogram("research_duration_seconds", "Time taken for full research pipeline", buckets=[10, 30, 60, 120, 300]) # 10s to 5min buckets
REQUESTS_TOTAL = Counter("research_requests_total", "Total requests received", ["status"])

# Role specific timing
AGENT_STEP_DURATION = Histogram("agent_step_duration_seconds", "Time spent in each agent role", ["role"])

# External API Latency
BRAVE_SEARCH_LATENCY = Histogram("brave_search_latency_bucket", "Latency of Brave Search API calls")
LLM_TOKENS = Counter("llm_tokens_total", "Total LLM tokens used", ["model"])

# System Health
ACTIVE_SSE = Gauge("active_sse_connections", "Number of active SSE streams")
SSE_DISCONNECTS = Counter("sse_disconnects_total", "Total SSE disconnections")

# FastAPI App
app = FastAPI(title="Market Analyst Agent")

# Create the metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Apply CORS middleware with secure configuration
app.add_middleware(
    CORSMiddleware,
    **Config.get_cors_config()
)


# Request/Response Models
class ResearchRequest(BaseModel):
    topic: str
    research_depth: int = 1 # 1=Standard (Brave), 2=Deep (Tavily), 3=Extensive


class AgentState:
    """Shared state for agent execution"""
    def __init__(self):
        self.current_step: str = "idle"
        self.logs: list = []
        self.sources: list = [] # List of {title, url, description}
        self.strategy: str = ""
        self.raw_data: str = ""
        self.insights: str = ""
        self.final_report: str = ""
        self.dashboard_url: str = ""
        self.sources: list = []


async def perform_market_research_stream(topic: str, research_depth: int = 1) -> AsyncGenerator[str, None]:
    """
    Orchestrates research pipeline and streams updates via SSE.

    Yields:
        SSE formatted messages with state updates
    """
    state = AgentState()
    client = get_gemini_client()

    def send_update(event: str, data: Dict[str, Any]):
        """Helper to send SSE formatted update"""
        return f"event: {event}\ndata: {json.dumps(data)}\n\n"

    try:
        ACTIVE_REQUESTS.inc()
        start_time = time.time()
        
        # Start
        state.current_step = "strategist"
        state.logs.append("🚀 Research started...")
        yield send_update("state", {
            "current_step": state.current_step,
            "logs": state.logs
        })
        await asyncio.sleep(0.1)  # Small delay for UI

        # ==== STEP 1: STRATEGIST ====
        with AGENT_STEP_DURATION.labels(role="strategist").time():
            state.logs.append("📋 Strategist is breaking down the topic...")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs
            })

            strategist_prompt = f"""You are 'The Strategist', a strategic planner for market intelligence.

Your task: Analyze the topic "{topic}" and create a research plan.

Output format:
1. Context Analysis: Brief overview of the topic
2. Key Research Questions: 3-5 specific questions to answer
3. Recommended Data Sources: Types of sources to consult

Be specific and actionable."""

            state.strategy = client.generate(strategist_prompt, temperature=0.7)
            state.logs.append("✓ Strategy complete")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs,
                "strategy": state.strategy
            })
        await asyncio.sleep(0.1)

        # ==== STEP 2: RESEARCHER ====
        with AGENT_STEP_DURATION.labels(role="researcher").time():
            state.current_step = "researcher"
            state.logs.append("🔍 Researcher is collecting market data...")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs
            })

            # Perform real web searches based on strategy
            state.logs.append("  → Performing web searches...")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs
            })

            # Extract key search queries from strategy (use LLM to extract)
            query_extraction_prompt = f"""Based on this research plan, extract 3-5 specific search queries that would help gather data.

Research Plan:
{state.strategy}

Output ONLY the search queries, one per line, without numbering or explanation.
Example format:
electric vehicle market size 2024
EV adoption rates statistics
top electric vehicle manufacturers"""

            queries_text = client.generate(query_extraction_prompt, temperature=0.3)
            search_queries = [q.strip() for q in queries_text.strip().split('\n') if q.strip()][:5]

            logger.debug(f"Generated Queries: {search_queries}")

            state.logs.append(f"  → Generated {len(search_queries)} search queries")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs
            })

            # Perform searches and collect results
            all_search_results = []
            for i, query in enumerate(search_queries, 1):
                try:
                    state.logs.append(f"  → Search {i}/{len(search_queries)}: {query[:50]}...")
                    yield send_update("state", {
                        "current_step": state.current_step,
                        "logs": state.logs
                    })

                    with BRAVE_SEARCH_LATENCY.time():
                        if research_depth >= 2:
                            # Use Tavily for Deep research
                            search_results = tavily_search(query, max_results=5, depth="advanced" if research_depth>=3 else "basic")
                        else:
                            # Use Brave for Standard research
                            search_results = search_web(query, count=3)
                            
                            # Use Brave for Standard research
                            search_results = search_web(query, count=3)
                            
                    logger.debug(f"Search result count: {len(search_results)}")
                    all_search_results.extend(search_results)
                    await asyncio.sleep(0.5)  # Small delay between searches

                except Exception as e:
                    logger.error(f"Exception in search loop: {e}")
                    state.logs.append(f"  ⚠️ Search {i} warning: Using fallback data")
                    yield send_update("state", {
                        "current_step": state.current_step,
                        "logs": state.logs
                    })

            # Store sources in state for frontend (AFTER loop)
            logger.debug(f"Storing {len(all_search_results)} sources in state")
            state.sources = all_search_results
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs,
                "sources": state.sources
            })

            # Format search results for LLM
            formatted_results = "\n\n".join([
                f"Source {i+1}: {r['title']}\nURL: {r['url']}\nDescription: {r['description']}"
                for i, r in enumerate(all_search_results[:15])  # Limit to 15 results
            ])

            # Generate analysis using real search results
            researcher_prompt = f"""You are 'The Researcher', a data collector for market research.

Research Plan:
{state.strategy}

Topic: {topic}

Real Web Search Results:
{formatted_results}

Your task: Analyze the search results and synthesize the key findings related to the research questions.

For each research question in the plan:
1. Extract relevant data points from the search results
2. Cite specific sources and URLs when available
3. Note key statistics, trends, and facts
4. Identify major companies/products mentioned
5. Highlight opportunities and challenges

Focus on factual information from the search results. If search results are limited, acknowledge this."""

            state.raw_data = client.generate(researcher_prompt, temperature=0.6)
            state.logs.append("✓ Data collection complete")
            state.logs.append(f"  → Analyzed {len(all_search_results)} search results")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs,
                "raw_data": state.raw_data
            })
        await asyncio.sleep(0.1)

        # ==== STEP 3: ANALYST ====
        with AGENT_STEP_DURATION.labels(role="analyst").time():
            state.current_step = "analyst"
            state.logs.append("📊 Analyst is processing findings...")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs
            })

            analyst_prompt = f"""You are 'The Analyst', an expert at extracting insights.

Research Data:
{state.raw_data}

Provide:
1. Major Trends: 3-4 key trends with data
2. Key Metrics: Market size, growth rates, etc.
3. Competitive Landscape: Main players
4. Opportunities & Threats
5. Actionable Insights"""

            state.insights = client.generate(analyst_prompt, temperature=0.5)
            state.logs.append("✓ Analysis complete")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs,
                "insights": state.insights
            })
        await asyncio.sleep(0.1)

        # ==== STEP 4: VISUALIZER (Grafana) ====
        with AGENT_STEP_DURATION.labels(role="visualizer").time():
            state.current_step = "visualizer"
            state.logs.append("📈 Visualizer is creating Grafana dashboard...")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs
            })
            
            
            logger.debug("Entering Visualizer Logic")
            try:
                # Generate Chart Data
                logger.debug("Calling generate_chart_data")
                chart_data = generate_chart_data(state.insights, topic)
                logger.debug(f"Generated Charts: {len(chart_data.get('charts', []))} charts found")
                
                state.logs.append(f"  → Generated {len(chart_data.get('charts', []))} native charts")
                
                # Store chart data in state (to be passed to synthesizer/final report)
                state.chart_data = chart_data

                yield send_update("state", {
                    "current_step": state.current_step,
                    "logs": state.logs
                })

            except Exception as e:
                state.logs.append(f"  ⚠️ Visualizer error: {str(e)}")
                logger.error(f"Visualizer Error: {e}")
        await asyncio.sleep(0.1)

        # ==== STEP 4: SYNTHESIZER ====
        with AGENT_STEP_DURATION.labels(role="synthesizer").time():
            state.current_step = "synthesizer"
            state.logs.append("📄 Synthesizer is generating final report...")
            yield send_update("state", {
                "current_step": state.current_step,
                "logs": state.logs
            })

            synthesizer_prompt = f"""You are 'The Synthesizer', expert at creating market research reports.

Topic: {topic}

Analysis:
{state.insights}

Create a professional report. CRITICAL: Start with JSON in markdown format:

```json
{{
  "title": "Market Research Report: [Topic]",
  "topic": "{topic}",
  "key_metrics": [
  "key_metrics": [
    {{"label": "Market Size", "value": "$XX.XB"}},
    {{"label": "Growth Rate", "value": "XX% CAGR"}},
    {{"label": "Key Players", "value": "X companies"}},
    {{"label": "Market Maturity", "value": "Growing/Mature/Emerging"}}
  ],
  "dashboard_url": "{state.dashboard_url}"
}}
```

## Executive Summary

[2-3 paragraphs]

## Market Overview

[Detailed analysis]

## Key Findings

[4-6 findings with data]

## Competitive Landscape

[Market dynamics]

## Opportunities & Recommendations

[Actionable insights]

## Conclusion

[Summary]

---
*Report generated by Market Analyst AI*"""

            state.final_report = client.generate(synthesizer_prompt, temperature=0.4)
            
            # Programmatically inject dashboard_url if exists and not present
            if state.dashboard_url and "dashboard_url" not in state.final_report:
               try:
                   # Simple string injection into the JSON block
                   state.final_report = state.final_report.replace(
                       '"key_metrics": [',
                       f'"dashboard_url": "{state.dashboard_url}",\n  "key_metrics": ['
                   )
               except Exception:
                   pass # Fallback to no injection

            # Inject Charts
            if hasattr(state, 'chart_data') and state.chart_data and "charts" not in state.final_report:
                try:
                    # Parse current report
                    report_json_str = state.final_report.split("```json")[1].split("```")[0].strip() if "```json" in state.final_report else state.final_report
                    report_obj = json.loads(report_json_str)
                    
                    # Add charts
                    report_obj["charts"] = state.chart_data.get("charts", [])
                    
                    # Reconstruct report string (tricky part is preserving the markdown outside JSON)
                    if "```json" in state.final_report:
                        pre_json = state.final_report.split("```json")[0]
                        post_json = state.final_report.split("```", 2)[2] # Get everything after the *second* backtick close? No.
                        # Easier way: Find the JSON block and replace it.
                        
                        new_json_block = json.dumps(report_obj, indent=2)
                        state.final_report = state.final_report.replace(report_json_str, new_json_block)
                    else:
                        # Fallback if structure is weird, just append or ignore
                        pass
                except Exception as e:
                     logger.error(f"Chart Injection Error: {e}")
                     pass

        # Complete!
        state.current_step = "complete"
        state.logs.append("✅ Research complete!")
        yield send_update("state", {
            "current_step": state.current_step,
            "logs": state.logs,
            "final_report": state.final_report
        })

        # Send final complete message
        yield send_update("complete", {
            "status": "success",
            "final_report": state.final_report
        })
        
        # Metrics - Success
        REQUESTS_TOTAL.labels(status="success").inc()
        REPORTS_COMPLETED.inc()

    except Exception as e:
        error_msg = f"❌ Error: {str(e)}"
        state.logs.append(error_msg)
        yield send_update("error", {
            "error": str(e),
            "logs": state.logs
        })
        
        # Metrics - Error
        REQUESTS_TOTAL.labels(status="error").inc()
        
    finally:
        ACTIVE_REQUESTS.dec()
        RESEARCH_DURATION.observe(time.time() - start_time)


@app.post("/research")
async def research_topic(request: ResearchRequest):
    """
    Start market research on a topic - returns SSE stream.
    """
    if not request.topic or len(request.topic.strip()) == 0:
        REQUESTS_TOTAL.labels(status="bad_request").inc()
        raise HTTPException(status_code=400, detail="Topic is required")

    if len(request.topic) > 500:
        REQUESTS_TOTAL.labels(status="bad_request").inc()
        raise HTTPException(status_code=400, detail="Topic too long (max 500 characters)")

    # Note: Success/Error and Active Counters are handled in the stream function's try/finally block
    # We don't increment REQUESTS_TOTAL here with 'success' yet, only when the stream actually completes successfully.
    # However, we might want to track 'received' here. But simpler to track result status in stream function.

    return StreamingResponse(
        perform_market_research_stream(request.topic, request.research_depth),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )





@app.get("/health")
@app.get("/health/ready")
async def health_check():
    """Health check endpoint"""
    try:
        # Verify Gemini client works
        client = get_gemini_client()
        return {
            "status": "healthy",
            "service": "Market Analyst Agent",
            "environment": Config.ENVIRONMENT,
            "model": Config.GEMINI_MODEL
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@app.get("/health/live")
async def liveness_check():
    """Kubernetes liveness probe - is the process running?"""
    return {"status": "alive"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Market Analyst Agent",
        "version": "2.0",
        "environment": Config.ENVIRONMENT,
        "endpoints": {
            "research": "POST /research - Start market research (SSE stream)",
            "health": "GET /health - Health check",
            "health_live": "GET /health/live - Liveness probe",
            "metrics": "GET /metrics - Prometheus-style metrics"
        }
    }


if __name__ == "__main__":
    logger.info(f"{'='*60}")
    logger.info("🚀 Starting Market Analyst Agent Server")
    logger.info(f"{'='*60}")
    logger.info(f"Environment: {Config.ENVIRONMENT}")
    logger.info(f"Port: {Config.PORT}")
    logger.info(f"Model: {Config.GEMINI_MODEL}")
    logger.info(f"CORS Origins: {', '.join(Config.ALLOWED_ORIGINS)}")
    logger.info(f"{'='*60}\n")

    uvicorn.run(app, host="0.0.0.0", port=Config.PORT)
