"use client";

import { ResearchDashboard } from "@/components/ResearchDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-grid flex flex-col">
        {/* Compact App Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
                G
              </div>
              <h1 className="font-bold text-slate-900 text-sm tracking-tight">Gemini Research Agent</h1>
            </div>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">v2.1.0</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-green-700 uppercase">System Active</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Main Workspace - Full Width, High Density */}
        <div className="flex-1 px-4 py-6 md:px-8 max-w-[1600px] mx-auto w-full">
          <div className="animate-fade-in">
            <ResearchDashboard />
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
