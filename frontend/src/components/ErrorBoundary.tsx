"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and display errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="text-left bg-gray-100 p-3 rounded-md mb-4">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Inline error display component for non-fatal errors
 */
export function ErrorMessage({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="text-red-500 text-xl mr-3">❌</div>
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
