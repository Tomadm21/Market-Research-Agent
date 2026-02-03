import asyncio
import time
import json
import logging
from typing import AsyncGenerator

from llm_client import get_gemini_client
from tools.search import search_web
from tools.tavily import tavily_search
from tools.charts import generate_chart_data
from .state import AgentState, send_sse_update
from .metrics import (
    ACTIVE_REQUESTS, REPORTS_COMPLETED, RESEARCH_DURATION, 
    REQUESTS_TOTAL, AGENT_STEP_DURATION, BRAVE_SEARCH_LATENCY
)

logger = logging.getLogger("market_analyst_agent")

async def perform_market_research_stream(topic: str, research_depth: int = 1) -> AsyncGenerator[str, None]:
    """
    Orchestrates research pipeline and streams updates via SSE.
    """
    state = AgentState()
    client = get_gemini_client()

    try:
        ACTIVE_REQUESTS.inc()
        start_time = time.time()
        
        # Start
        state.current_step = "strategist"
        state.logs.append("🚀 Research started...")
        yield send_sse_update("state", {
            "current_step": state.current_step,
            "logs": state.logs
        })
        await asyncio.sleep(0.1)

        # ==== STEP 1: STRATEGIST ====
        with AGENT_STEP_DURATION.labels(role="strategist").time():
            state.logs.append("📋 Strategist is breaking down the topic...")
            yield send_sse_update("state", {
                "current_step": state.current_step,
                "logs": state.logs
            })

            strategist_prompt = f"""You are 'The Strategist', a strategic planner for market intelligence.
Your task: Analyze the topic "{topic}" and create a research plan.
Output format:
1. Context Analysis: Brief overview of the topic
2. Key Research Questions: 3-5 specific questions to answer
3. Recommended Data Sources: Types of sources to consult"""

            state.strategy = client.generate(strategist_prompt, temperature=0.7)
            state.logs.append("✓ Strategy complete")
            yield send_sse_update("state", {
                "current_step": state.current_step,
                "logs": state.logs,
                "strategy": state.strategy
            })

        # ==== STEP 2: RESEARCHER ====
        with AGENT_STEP_DURATION.labels(role="researcher").time():
            state.current_step = "researcher"
            state.logs.append("🔍 Researcher is collecting market data...")
            
            # Extract queries
            query_extraction_prompt = f"Extract 3-5 specific search queries from this plan:\n{state.strategy}\nOutput ONLY queries, one per line."
            queries_text = client.generate(query_extraction_prompt, temperature=0.3)
            search_queries = [q.strip() for q in queries_text.strip().split('\n') if q.strip()][:5]

            all_search_results = []
            for i, query in enumerate(search_queries, 1):
                try:
                    state.logs.append(f"  → Search {i}/{len(search_queries)}: {query[:50]}...")
                    yield send_sse_update("state", {"current_step": state.current_step, "logs": state.logs})

                    with BRAVE_SEARCH_LATENCY.time():
                        if research_depth >= 2:
                            results = tavily_search(query, max_results=5, depth="advanced" if research_depth>=3 else "basic")
                        else:
                            results = search_web(query, count=3)
                        all_search_results.extend(results)
                    await asyncio.sleep(0.5)
                except Exception as e:
                    logger.error(f"Search error: {e}")

            state.sources = all_search_results
            yield send_sse_update("state", {"current_step": state.current_step, "logs": state.logs, "sources": state.sources})

            # Research synthesis
            formatted_results = "\n\n".join([f"Source {i+1}: {r['title']}\nURL: {r['url']}\nDescription: {r['description']}" for i, r in enumerate(all_search_results[:15])])
            researcher_prompt = f"Analyze source data for '{topic}':\n{formatted_results}\nSynthesize findings based on strategy."
            state.raw_data = client.generate(researcher_prompt, temperature=0.6)
            state.logs.append("✓ Data collection complete")
            yield send_sse_update("state", {"current_step": state.current_step, "logs": state.logs, "raw_data": state.raw_data})

        # ==== STEP 3: ANALYST ====
        with AGENT_STEP_DURATION.labels(role="analyst").time():
            state.current_step = "analyst"
            state.logs.append("📊 Analyst is processing findings...")
            yield send_sse_update("state", {"current_step": state.current_step, "logs": state.logs})

            analyst_prompt = f"Extract insights from data:\n{state.raw_data}\nProvide: Trends, Metrics, Competitors, SWOT, Actionable Insights."
            state.insights = client.generate(analyst_prompt, temperature=0.5)
            state.logs.append("✓ Analysis complete")
            yield send_sse_update("state", {"current_step": state.current_step, "logs": state.logs, "insights": state.insights})

        # ==== STEP 4: VISUALIZER ====
        with AGENT_STEP_DURATION.labels(role="visualizer").time():
            state.current_step = "visualizer"
            state.logs.append("📈 Generating visualization data...")
            yield send_sse_update("state", {"current_step": state.current_step, "logs": state.logs})
            try:
                state.chart_data = generate_chart_data(state.insights, topic)
                state.logs.append(f"  → Generated {len(state.chart_data.get('charts', []))} charts")
            except Exception as e:
                logger.error(f"Visualizer error: {e}")

        # ==== STEP 5: SYNTHESIZER ====
        with AGENT_STEP_DURATION.labels(role="synthesizer").time():
            state.current_step = "synthesizer"
            state.logs.append("📄 Generating final report...")
            yield send_sse_update("state", {"current_step": state.current_step, "logs": state.logs})

            synthesizer_prompt = f"Create a professional market report for '{topic}' based on:\n{state.insights}\nInclude a JSON block for metadata."
            state.final_report = client.generate(synthesizer_prompt, temperature=0.4)
            
            # Chart injection logic
            if state.chart_data and "charts" not in state.final_report:
                try:
                    if "```json" in state.final_report:
                        json_parts = state.final_report.split("```json")
                        content_json = json.loads(json_parts[1].split("```")[0].strip())
                        content_json["charts"] = state.chart_data.get("charts", [])
                        new_json = json.dumps(content_json, indent=2)
                        state.final_report = state.final_report.replace(json_parts[1].split("```")[0].strip(), new_json)
                except Exception as e:
                    logger.error(f"Injection error: {e}")

        # Complete
        state.current_step = "complete"
        state.logs.append("✅ Research complete!")
        yield send_sse_update("state", {"current_step": state.current_step, "logs": state.logs, "final_report": state.final_report})
        yield send_sse_update("complete", {"status": "success", "final_report": state.final_report})
        
        REQUESTS_TOTAL.labels(status="success").inc()
        REPORTS_COMPLETED.inc()

    except Exception as e:
        logger.error(f"Orchestrator error: {e}")
        state.logs.append(f"❌ Error: {str(e)}")
        yield send_sse_update("error", {"error": str(e), "logs": state.logs})
        REQUESTS_TOTAL.labels(status="error").inc()
    finally:
        ACTIVE_REQUESTS.dec()
        RESEARCH_DURATION.observe(time.time() - start_time)
