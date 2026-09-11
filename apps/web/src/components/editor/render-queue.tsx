"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export interface RenderJob {
  id: string;
  projectId: string;
  projectName: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  currentFrame: number;
  totalFrames: number;
  format: string;
  resolution: string;
  fps: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  outputFile?: string;
}

interface RenderQueueProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RenderQueue({ isOpen, onClose }: RenderQueueProps) {
  const [jobs, setJobs] = useState<RenderJob[]>([
    // Mock data for demo
    {
      id: "1",
      projectId: "proj-1",
      projectName: "Summer Vibes Visualizer",
      status: "completed",
      progress: 100,
      currentFrame: 1800,
      totalFrames: 1800,
      format: "mp4",
      resolution: "1080p",
      fps: 30,
      startedAt: new Date(Date.now() - 300000),
      completedAt: new Date(),
      outputFile: "summer-vibes.mp4",
    },
    {
      id: "2",
      projectId: "proj-2",
      projectName: "Night Drive Loop",
      status: "processing",
      progress: 65,
      currentFrame: 1170,
      totalFrames: 1800,
      format: "mp4",
      resolution: "1080p",
      fps: 30,
      startedAt: new Date(Date.now() - 120000),
    },
    {
      id: "3",
      projectId: "proj-3",
      projectName: "Beat Preview",
      status: "queued",
      progress: 0,
      currentFrame: 0,
      totalFrames: 900,
      format: "webm",
      resolution: "720p",
      fps: 30,
    },
  ]);

  const activeJobs = jobs.filter((j) => j.status === "processing" || j.status === "queued");
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "failed");

  const cancelJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "cancelled" as const } : j))
    );
  };

  const retryJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: "queued" as const, progress: 0, currentFrame: 0, error: undefined }
          : j
      )
    );
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusColor = (status: RenderJob["status"]) => {
    switch (status) {
      case "queued":
        return "text-zinc-400 bg-zinc-500/10";
      case "processing":
        return "text-beatvision-400 bg-beatvision-500/10";
      case "completed":
        return "text-green-400 bg-green-500/10";
      case "failed":
        return "text-red-400 bg-red-500/10";
      case "cancelled":
        return "text-zinc-500 bg-zinc-500/10";
      default:
        return "text-zinc-400 bg-zinc-500/10";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] bg-surface-1 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Render Queue</h2>
            {activeJobs.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-beatvision-500/20 text-beatvision-400">
                {activeJobs.length} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-surface-3 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Job List */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p>No render jobs</p>
              <p className="text-sm">Export a project to see it here</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-surface-2 rounded-xl border border-white/5 p-4"
              >
                {/* Job Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{job.projectName}</h3>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {job.resolution} • {job.fps}fps • {job.format.toUpperCase()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                {/* Progress Bar */}
                {(job.status === "processing" || job.status === "queued") && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span>
                        Frame {job.currentFrame.toLocaleString()} / {job.totalFrames.toLocaleString()}
                      </span>
                      <span>{Math.round(job.progress)}%</span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-beatvision-500 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {job.status === "failed" && job.error && (
                  <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {job.error}
                  </div>
                )}

                {/* Completed Output */}
                {job.status === "completed" && job.outputFile && (
                  <div className="mb-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-400">{job.outputFile}</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Download
                    </Button>
                  </div>
                )}

                {/* Job Footer */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    {job.startedAt && (
                      <span>
                        Started {formatDuration(Date.now() - job.startedAt.getTime())} ago
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {job.status === "processing" && (
                      <Button variant="ghost" size="sm" onClick={() => cancelJob(job.id)}>
                        Cancel
                      </Button>
                    )}
                    {job.status === "failed" && (
                      <Button variant="ghost" size="sm" onClick={() => retryJob(job.id)}>
                        Retry
                      </Button>
                    )}
                    {(job.status === "completed" || job.status === "failed" || job.status === "cancelled") && (
                      <Button variant="ghost" size="sm" onClick={() => deleteJob(job.id)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {completedJobs.length > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {completedJobs.length} completed • {failedJobs.length} failed
            </p>
            <Button variant="secondary" size="sm">
              Clear Completed
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
