"use client";

import { useState } from "react";
import { useResearch } from "@/hooks/useResearch";
import { ResearchInput } from "./ResearchInput";
import { ResearchStatus } from "./ResearchStatus";
import { ReportViewer } from "./ReportViewer";
import { ErrorMessage } from "./ErrorBoundary";
import type { ParsedReport, ReportJson } from "@/types/research";

/**
 * Main dashboard component for market research - 3-phase layout
 */
export function ResearchDashboard() {
  const { state, isLoading, error, startResearch, reset } = useResearch();

  // Parse the final report to extract JSON and text
  const parsedReport: ParsedReport | null = state.final_report
    ? tryParseJson(state.final_report)
    : null;

  const showStatus = state.current_step !== "idle" || isLoading;
  const showReport = state.final_report && state.current_step === "complete";

  // Determine current phase
  const [activeTab, setActiveTab] = useState<'report' | 'sources'>('report');

  const currentPhase = getPhase(state.current_step);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      {/* SIDEBAR: Controls & Context (30%) */}
      {/* SIDEBAR: Controls & Context (30%) */}
      <div className="w-full lg:w-[350px] flex flex-col gap-4 animate-fade-in sticky top-24 self-start h-full">
        {/* Input Module */}
        <div className="card p-5 border border-slate-300 shadow-sm flex-none flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mission Control</span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Research Topic</h3>
            <p className="text-xs text-slate-500 mb-4">Define your parameter space</p>
            <ResearchInput
              onSubmit={startResearch}
              isLoading={isLoading}
              onReset={reset}
            />
          </div>

          {/* Quick Stats / Info (Placeholder for now) */}
          <div className="mt-2 bg-slate-50 rounded-md p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">System Status</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {isLoading ? "Swarm Active: Reasoning Loop" : "Ready for Tasking"}
            </p>
          </div>
        </div>

        {/* History / Recent Inquiries Block */}
        <div className="card p-5 border border-slate-300 shadow-sm flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-none">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Inquiries</span>
            <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700">VIEW ALL</button>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
            {[
              { id: 1, topic: "Impact of AI on Healthcare 2026", date: "2h ago", status: "completed" },
              { id: 2, topic: "Nvidia H100 Supply Chain Analysis", date: "5h ago", status: "completed" },
              { id: 3, topic: "SpaceX Starship Trajectory Optimization", date: "1d ago", status: "failed" },
              { id: 4, topic: "Global EV Market Trends Q1", date: "2d ago", status: "completed" },
              { id: 5, topic: "Quantum Computing vs RSA Encryption", date: "3d ago", status: "completed" },
              { id: 6, topic: "CRISPR Gene Editing Regulations EU", date: "4d ago", status: "completed" },
            ].map((item) => (
              <div key={item.id} className="group flex items-start gap-3 p-3 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer flex-none">
                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${item.status === 'completed' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-700 transition-colors">{item.topic}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.date}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN STAGE: Dynamic Content (70%) */}
      <div className="flex-1 flex flex-col animate-fade-in delay-75">

        {/* VIEW 1: IDLE (Welcome) */}
        {!isLoading && !parsedReport && !error && (
          <div className="h-full card border-slate-200 border-dashed bg-slate-50/50 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to Research</h2>
            <p className="text-sm text-slate-500 max-w-md">
              Enter a topic in the sidebar to deploy the agent swarm. The system will plan, research, analyze, and synthesize a comprehensive report.
            </p>
          </div>
        )}

        {/* VIEW 2: PROCESSING (Reasoning Engine) */}
        {isLoading && (
          <div className="h-full flex flex-col gap-4">
            {/* Pipeline Visualization */}
            <div className="card p-4 border-blue-200 bg-blue-50/30 flex items-center justify-between">
              {['Plan', 'Research', 'Analyze', 'Report'].map((step, i) => {
                const isActive = (state.current_step === step.toLowerCase()) ||
                  (step === 'Report' && state.current_step === 'synthesizer');
                const isPast = ['plan', 'research', 'analyze', 'report'].indexOf(state.current_step) > i || state.current_step === 'complete';

                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all
                      ${isActive ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-md' : ''}
                      ${isPast ? 'bg-blue-100 border-blue-200 text-blue-600' : ''}
                      ${!isActive && !isPast ? 'bg-white border-slate-200 text-slate-300' : ''}
                    `}>
                      {isActive ? <span className="animate-spin">⟳</span> : (isPast ? '✓' : i + 1)}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                      {step}
                    </span>
                    {i < 3 && <div className="w-12 h-px bg-slate-200 hidden md:block"></div>}
                  </div>
                );
              })}
            </div>

            {/* Cognitive Stream (Expanded) */}
            <div className="flex-1 card border-blue-500 shadow-md flex flex-col overflow-hidden">
              <ResearchStatus
                currentStep={state.current_step}
                logs={state.logs}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: RESULT (Modular Report) */}
        {showReport && parsedReport && !isLoading && (
          <div className="h-full flex flex-col gap-4">
            {/* Report Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Research Results</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">Export PDF</button>
                <button className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">Copy</button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 card border-slate-300 shadow-sm overflow-hidden flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'report' ? 'text-blue-600 border-blue-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                  Full Report
                </button>
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'sources' ? 'text-blue-600 border-blue-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                  Source Data
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-white" id="report-section">
                {activeTab === 'report' ? (
                  <ReportViewer
                    reportJson={parsedReport.json}
                    reportText={parsedReport.text}
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {state.sources && state.sources.length > 0 ? (
                      state.sources.map((source, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col justify-between items-start mb-2">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-blue-600 hover:underline block mb-1"
                            >
                              {source.title || "Untitled Source"}
                            </a>
                            <div className="text-[10px] font-mono text-slate-500 break-all bg-slate-50 p-1 rounded border border-slate-100 mb-2 select-all">
                              {source.url}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-3">
                            {source.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="font-medium text-sm">No source data available yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card border-red-200 bg-red-50 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">!</div>
            <h3 className="font-bold text-red-900">System Error</h3>
            <ErrorMessage error={error} onRetry={reset} />
          </div>
        )}

      </div>
    </div>
  );
}

/**
 * Determine current phase based on step
 */
function getPhase(step: string): number {
  if (step === "idle") return 0;
  if (step === "strategist") return 1;
  if (["researcher", "analyst", "synthesizer"].includes(step)) return 2;
  if (step === "complete") return 3;
  return 0;
}

/**
 * Try to parse JSON from the report text
 */
function tryParseJson(text: string): ParsedReport {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[1]) as ReportJson;
      const remainingText = text.replace(jsonMatch[0], "").trim();
      return { json, text: remainingText };
    }
    return { json: null, text };
  } catch (e) {
    console.warn("Failed to parse report JSON:", e);
    return { json: null, text };
  }
}
