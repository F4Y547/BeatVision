"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BatchJob {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  status: "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  outputFormat: string;
  resolution: string;
  error?: string;
}

interface BatchRenderQueueProps {
  jobs: BatchJob[];
  onRetry: (jobId: string) => void;
  onCancel: (jobId: string) => void;
  onClearCompleted: () => void;
  onAddJob: () => void;
}

export function BatchRenderQueue({
  jobs,
  onRetry,
  onCancel,
  onClearCompleted,
  onAddJob,
}: BatchRenderQueueProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeJobs = jobs.filter((j) => j.status === "processing" || j.status === "queued");
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "failed");

  const totalProgress =
    jobs.length > 0
      ? Math.round(jobs.reduce((sum, j) => sum + j.progress, 0) / jobs.length)
      : 0;

  const getStatusColor = (status: BatchJob["status"]) => {
    switch (status) {
      case "processing":
        return "text-beatvision-400";
      case "completed":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "cancelled":
        return "text-zinc-500";
      default:
        return "text-zinc-400";
    }
  };

  const getStatusIcon = (status: BatchJob["status"]) => {
    switch (status) {
      case "processing":
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case "completed":
        return (
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "failed":
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "cancelled":
        return (
          <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Batch Render Queue</CardTitle>
            <span className="text-xs text-zinc-500">
              {activeJobs.length} active, {completedJobs.length} done
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onAddJob}>
              + Add Job
            </Button>
            {completedJobs.length > 0 && (
              <Button size="sm" variant="ghost" onClick={onClearCompleted}>
                Clear Done
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        {activeJobs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Overall Progress</span>
              <span className="text-white">{totalProgress}%</span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-beatvision-500 rounded-full transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Job List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>No jobs in queue</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg"
              >
                {getStatusIcon(job.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {job.projectName}
                    </p>
                    <span className={`text-[10px] ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-zinc-500">
                      {job.resolution} • {job.outputFormat.toUpperCase()}
                    </span>
                    {job.status === "processing" && (
                      <span className="text-[10px] text-beatvision-400">
                        {job.progress}%
                      </span>
                    )}
                    {job.error && (
                      <span className="text-[10px] text-red-400 truncate">
                        {job.error}
                      </span>
                    )}
                  </div>
                  {job.status === "processing" && (
                    <div className="h-1 bg-surface-3 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-beatvision-500 rounded-full"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  {job.status === "failed" && (
                    <button
                      onClick={() => onRetry(job.id)}
                      className="p-1 text-zinc-400 hover:text-beatvision-400"
                      title="Retry"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                  {job.status === "processing" && (
                    <button
                      onClick={() => onCancel(job.id)}
                      className="p-1 text-zinc-400 hover:text-red-400"
                      title="Cancel"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
