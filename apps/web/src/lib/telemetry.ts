"use client";

import { useEffect, useCallback } from "react";

export interface ErrorReport {
  id: string;
  timestamp: Date;
  type: "error" | "warning";
  message: string;
  stack?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  userAgent: string;
  url: string;
}

export interface TelemetryEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class ErrorTracker {
  private queue: ErrorReport[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Flush queue every 30 seconds
    if (typeof window !== "undefined") {
      this.flushInterval = setInterval(() => this.flush(), 30000);

      // Capture unhandled errors
      window.addEventListener("error", (event) => {
        this.captureError({
          message: event.message,
          stack: event.error?.stack,
          type: "error",
        });
      });

      // Capture unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        this.captureError({
          message: String(event.reason),
          type: "error",
        });
      });
    }
  }

  captureError(error: Partial<ErrorReport>) {
    const report: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: error.type || "error",
      message: error.message || "Unknown error",
      stack: error.stack,
      component: error.component,
      action: error.action,
      metadata: error.metadata,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    this.queue.push(report);
    console.error("[ErrorTracker]", report);

    // Flush immediately for critical errors
    if (report.type === "error") {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const errors = [...this.queue];
    this.queue = [];

    try {
      // In production, send to error tracking service
      // await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errors) });
      console.log("[ErrorTracker] Flushed", errors.length, "errors");
    } catch (e) {
      // Re-queue on failure
      this.queue.unshift(...errors);
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Singleton instance
let errorTracker: ErrorTracker | null = null;

export function getErrorTracker(): ErrorTracker {
  if (!errorTracker) {
    errorTracker = new ErrorTracker();
  }
  return errorTracker;
}

// Hook for capturing errors in components
export function useErrorTracker() {
  const captureError = useCallback(
    (error: Partial<ErrorReport>) => {
      getErrorTracker().captureError(error);
    },
    []
  );

  const captureException = useCallback(
    (error: Error, component?: string) => {
      getErrorTracker().captureError({
        message: error.message,
        stack: error.stack,
        component,
        type: "error",
      });
    },
    []
  );

  const captureMessage = useCallback(
    (message: string, type: "error" | "warning" = "warning") => {
      getErrorTracker().captureError({
        message,
        type,
      });
    },
    []
  );

  return { captureError, captureException, captureMessage };
}

// Telemetry for usage analytics
class Telemetry {
  private events: TelemetryEvent[] = [];
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(name: string, properties?: Record<string, any>) {
    const event: TelemetryEvent = {
      name,
      properties,
      timestamp: new Date(),
    };

    this.events.push(event);
    console.log("[Telemetry]", name, properties);

    // Flush in batches
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  async flush() {
    if (this.events.length === 0) return;

    const events = [...this.events];
    this.events = [];

    try {
      // In production, send to analytics service
      // await fetch('/api/telemetry', { method: 'POST', body: JSON.stringify({ userId: this.userId, events }) });
      console.log("[Telemetry] Flushed", events.length, "events");
    } catch (e) {
      this.events.unshift(...events);
    }
  }

  // Convenience methods
  trackPageView(page: string) {
    this.track("page_view", { page });
  }

  trackAction(action: string, category?: string) {
    this.track("action", { action, category });
  }

  trackFeature(feature: string, enabled: boolean) {
    this.track("feature_toggle", { feature, enabled });
  }

  trackExport(format: string, resolution: string, duration: number) {
    this.track("export", { format, resolution, duration });
  }

  trackError(error: string, component?: string) {
    this.track("error", { error, component });
  }
}

// Singleton instance
let telemetry: Telemetry | null = null;

export function getTelemetry(): Telemetry {
  if (!telemetry) {
    telemetry = new Telemetry();
  }
  return telemetry;
}

// Hook for telemetry
export function useTelemetry() {
  const track = useCallback(
    (name: string, properties?: Record<string, any>) => {
      getTelemetry().track(name, properties);
    },
    []
  );

  return {
    track,
    trackPageView: getTelemetry().trackPageView.bind(getTelemetry()),
    trackAction: getTelemetry().trackAction.bind(getTelemetry()),
    trackFeature: getTelemetry().trackFeature.bind(getTelemetry()),
    trackExport: getTelemetry().trackExport.bind(getTelemetry()),
    trackError: getTelemetry().trackError.bind(getTelemetry()),
  };
}

// React Error Boundary helper
export function logComponentError(error: Error, componentStack: string) {
  getErrorTracker().captureError({
    message: error.message,
    stack: error.stack,
    component: componentStack,
    type: "error",
  });
}
