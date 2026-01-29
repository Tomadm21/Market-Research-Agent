"use client";

import { useRef, useEffect } from "react";

interface ResearchStatusProps {
  currentStep: string;
  logs: string[];
}

/**
 * Terminal-style status display with agent logs
 */
export function ResearchStatus({ currentStep, logs = [] }: ResearchStatusProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Map step to display configuration
  const getAgentConfig = (log: string) => {
    if (log.includes("Strategist") || log.includes("Strategy")) return { name: "Planner", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" };
    if (log.includes("Researcher") || log.includes("Search")) return { name: "Researcher", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" };
    if (log.includes("Analyst")) return { name: "Analyst", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" };
    if (log.includes("Synthesizer") || log.includes("Report")) return { name: "Writer", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" };
    return { name: "System", color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" };
  };

  return (
    <div className="bg-slate-50 rounded-lg flex flex-col h-full min-h-[400px]">
      {/* Activity Stream Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white rounded-t-lg flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Cognitive Stream</span>
        </div>
        <div className="flex gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${logs.length > 0 ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}></div>
        </div>
      </div>

      {/* Stream Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">Waiting for agents...</span>
          </div>
        ) : (
          logs.map((log, i) => {
            const config = getAgentConfig(log);
            const message = log.replace(/^[✓✅🚀📋🔍📊📄❌⚠️]\s*/, '').replace(/^(Strategist|Researcher|Analyst|Synthesizer)\s*(is\s*)?/i, '');
            const isLatest = i === logs.length - 1;

            return (
              <div key={i} className={`flex gap-3 text-sm animate-fade-in ${isLatest ? 'opacity-100' : 'opacity-80'}`}>
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border ${config.bg} ${config.color} ${config.border}`}>
                    {config.name[0]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${config.color}`}>{config.name}</span>
                    <span className="text-[10px] text-slate-300 font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium break-words">
                    {message}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator at bottom */}
        {currentStep !== "complete" && currentStep !== "idle" && logs.length > 0 && (
          <div className="flex items-center gap-2 pl-[36px] pt-1 opacity-50">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
