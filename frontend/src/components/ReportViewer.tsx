"use client";

import { Activity } from "lucide-react";
import DataVisualizer from './DataVisualizer';
import type { ReportJson, KeyMetric } from "@/types/research";

interface ReportViewerProps {
  reportJson: ReportJson | null;
  reportText: string;
}

/**
 * Displays the final research report with metrics and content
 */
export function ReportViewer({ reportJson, reportText }: ReportViewerProps) {
  if (!reportJson && !reportText) return null;

  return (
    <div className="card p-8 animate-fade-in">
      {/* Report Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">
              Research Complete
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {reportJson?.title || reportJson?.topic || "Market Analysis Report"}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              const fullReport = reportJson
                ? `# ${reportJson.title}\n\n${reportText}`
                : reportText;
              navigator.clipboard.writeText(fullReport);
            }}
            className="btn-secondary text-sm flex items-center gap-2"
            title="Copy to clipboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            onClick={() => {
              const fullReport = reportJson
                ? `# ${reportJson.title}\n\n${reportText}`
                : reportText;
              const blob = new Blob([fullReport], { type: "text/markdown" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `research-${Date.now()}.md`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>

          {/* Dashboard Button Removed */}
        </div>
      </div>

      {/* Native Interactive Charts */}
      {reportJson?.charts && reportJson.charts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">Market Visualization</h2>
          </div>
          <DataVisualizer charts={reportJson.charts} />
        </div>
      )}

      {/* Key Metrics Grid */}
      {reportJson?.key_metrics && reportJson.key_metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {reportJson.key_metrics.map((metric: KeyMetric, idx: number) => (
            <div key={idx} className="metric-card">
              <p className="metric-label">{metric.label}</p>
              <p className="metric-value">{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Report Content */}
      <div className="border-t border-slate-100 pt-8">
        <div className="prose prose-slate max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
            {formatReportText(reportText)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format report text with proper markdown-style headings
 */
function formatReportText(text: string): React.ReactNode {
  // Split by lines and process
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    // Main headings (##)
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} className="text-xl font-bold text-slate-800 mt-8 mb-4 first:mt-0">
          {line.replace('## ', '')}
        </h3>
      );
    }

    // Sub headings (###)
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-lg font-semibold text-slate-700 mt-6 mb-3">
          {line.replace('### ', '')}
        </h4>
      );
    }

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={idx} className="ml-4 mb-2 text-slate-600">
          {line.replace(/^[-*]\s/, '')}
        </li>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      return (
        <li key={idx} className="ml-4 mb-2 text-slate-600 list-decimal">
          {line.replace(/^\d+\.\s/, '')}
        </li>
      );
    }

    // Bold text (**text**)
    if (line.includes('**')) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={idx} className="mb-3 text-slate-600">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="font-semibold text-slate-800">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }

    // Empty line
    if (line.trim() === '') {
      return <div key={idx} className="h-2" />;
    }

    // Regular paragraph
    return (
      <p key={idx} className="mb-3 text-slate-600">
        {line}
      </p>
    );
  });
}
