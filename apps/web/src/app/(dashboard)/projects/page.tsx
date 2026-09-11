"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const mockProjects = [
  {
    id: "1",
    name: "Summer Vibes",
    status: "completed" as const,
    updatedAt: new Date("2026-09-08"),
  },
  {
    id: "2",
    name: "Night Drive",
    status: "draft" as const,
    updatedAt: new Date("2026-09-09"),
  },
];

export default function ProjectsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-zinc-400 mt-1">
            Manage your music visualizers
          </p>
        </div>
        <Link href="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>

      {mockProjects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-zinc-400 mb-4">
            Create your first music visualizer
          </p>
          <Link href="/projects/new">
            <Button>Create Project</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}/editor`}>
              <Card className="hover:border-beatvision-500/50 transition-colors cursor-pointer h-full">
                <div className="aspect-video rounded-lg bg-surface-2 mb-4 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-zinc-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <h3 className="font-medium truncate">{project.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-zinc-500/10 text-zinc-400"
                    }`}
                  >
                    {project.status}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {project.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
