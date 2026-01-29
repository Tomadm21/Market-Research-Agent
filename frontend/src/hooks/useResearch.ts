"use client";

import { useState, useCallback, useRef } from "react";
import type {
  AgentState,
  UseResearchReturn,
  SSEStateEvent,
  SSEErrorEvent,
} from "@/types/research";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const initialState: AgentState = {
  current_step: "idle",
  logs: [],
};

/**
 * Custom hook for managing market research via SSE API
 */
export function useResearch(): UseResearchReturn {
  const [state, setState] = useState<AgentState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(initialState);
    setIsLoading(false);
    setError(null);
  }, []);

  const startResearch = useCallback(async (topic: string, research_depth: number = 1) => {

    reset();
    setIsLoading(true);
    setError(null);


    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch(`${BACKEND_URL}/research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, research_depth }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }


      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });


        const events = buffer.split("\n\n");
        buffer = events.pop() || ""; // Keep incomplete event in buffer

        for (const eventStr of events) {
          if (!eventStr.trim()) continue;


          const lines = eventStr.split("\n");
          let eventType = "";
          let eventData = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7);
            } else if (line.startsWith("data: ")) {
              eventData = line.slice(6);
            }
          }

          if (!eventType || !eventData) continue;

          try {
            const data = JSON.parse(eventData);

            switch (eventType) {
              case "state":
                const stateData = data as SSEStateEvent;
                setState((prev) => ({
                  ...prev,
                  current_step: stateData.current_step,
                  logs: stateData.logs || prev.logs,
                  strategy: stateData.strategy || prev.strategy,
                  raw_data: stateData.raw_data || prev.raw_data,
                  insights: stateData.insights || prev.insights,
                  final_report: stateData.final_report || prev.final_report,
                  sources: stateData.sources || prev.sources,
                }));
                break;

              case "complete":
                setState((prev) => ({
                  ...prev,
                  current_step: "complete",
                }));
                setIsLoading(false);
                break;

              case "error":
                const errorData = data as SSEErrorEvent;
                setState((prev) => ({
                  ...prev,
                  current_step: "error",
                  logs: errorData.logs || prev.logs,
                  error: errorData.error,
                }));
                setError(errorData.error);
                setIsLoading(false);
                break;
            }
          } catch (parseError) {
            console.error("Failed to parse SSE event:", parseError);
          }
        }
      }

      setIsLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          // Request was cancelled, don't set error
          return;
        }
        setError(err.message);
        setState((prev) => ({
          ...prev,
          current_step: "error",
          error: err.message,
        }));
      } else {
        setError("An unknown error occurred");
      }
      setIsLoading(false);
    }
  }, [reset]);

  return {
    state,
    isLoading,
    error,
    startResearch,
    reset,
  };
}
