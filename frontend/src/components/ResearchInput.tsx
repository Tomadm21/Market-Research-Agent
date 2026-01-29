"use client";

import { useState, useEffect, FormEvent } from "react";

interface ResearchInputProps {
  onSubmit: (topic: string, depth: number) => void;
  isLoading: boolean;
  onReset?: () => void;
}

const PLACEHOLDERS = [
  "Global semiconductor supply chain risks...",
  "Generative AI market consolidation trends...",
  "Renewable energy storage technologies...",
  "Quantum computing commercialization timeline...",
];

/**
 * Compact research topic input form
 */
export function ResearchInput({ onSubmit, isLoading, onReset }: ResearchInputProps) {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState(1);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim(), depth);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative group">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full px-3 py-3 text-sm bg-white border border-slate-300 rounded-md text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all placeholder:text-slate-400 font-medium shadow-sm"
          maxLength={500}
          suppressHydrationWarning={true}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-blue-600 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
      </div>

      {/* Research Depth Selector */}
      <div className="flex gap-2 mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-center mr-2">Detail Level:</span>
        <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
          {[
            { id: 1, label: "Standard" },
            { id: 2, label: "Deep" },
            { id: 3, label: "Extensive" }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setDepth(mode.id)}
              className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${depth === mode.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!topic.trim() || isLoading}
          className="flex-1 btn-primary text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 py-2.5 shadow-sm"
        >
          {isLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              <span className="text-[10px]">Processing</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Start</span>
            </>
          )}
        </button>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="btn-secondary px-5"
          >
            <span className="sr-only">Reset</span>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Quick suggestions */}
      <div className="pt-2">
        <div className="flex flex-wrap gap-2">
          {["Semiconductors", "SaaS Trends", "Fintech 2026"].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setTopic(suggestion)}
              disabled={isLoading}
              className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-md transition-colors border border-slate-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
