/**
 * TypeScript types for the Market Research Agent
 */

// Agent pipeline steps
export type ResearchStep =
  | "idle"
  | "strategist"
  | "researcher"
  | "analyst"
  | "synthesizer"
  | "complete"
  | "error";

// Key metric in the final report
export interface KeyMetric {
  label: string;
  value: string;
}

export interface Source {
  title: string;
  url: string;
  description: string;
}

// JSON structure in the final report
export interface ReportJson {
  title: string;
  topic: string;
  key_metrics: KeyMetric[];
  dashboard_url?: string;
  charts?: ChartConfig[];
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie';
  title: string;
  subtitle?: string;
  data: any[];
  xAxisKey: string;
  dataKey: string;
  color?: string;
  color?: string;
}
// Parsed report with JSON and text parts
export interface ParsedReport {
  json: ReportJson | null;
  text: string;
}

// Full agent state
export interface AgentState {
  current_step: ResearchStep;
  logs: string[];
  strategy?: string;
  raw_data?: string;
  insights?: string;
  final_report?: string;
  sources?: Source[];
  error?: string;
}

// SSE Event types from backend
export type SSEEventType = "state" | "complete" | "error";

export interface SSEStateEvent {
  current_step: ResearchStep;
  logs: string[];
  strategy?: string;
  raw_data?: string;
  insights?: string;
  insights?: string;
  final_report?: string;
  sources?: Source[];
}

export interface SSECompleteEvent {
  status: "success";
  final_report: string;
}

export interface SSEErrorEvent {
  error: string;
  logs: string[];
}

// Research hook return type
export interface UseResearchReturn {
  state: AgentState;
  isLoading: boolean;
  error: string | null;
  startResearch: (topic: string) => void;
  reset: () => void;
}
