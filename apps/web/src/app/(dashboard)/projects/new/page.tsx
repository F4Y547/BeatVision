"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FileUpload } from "@/components/upload/file-upload";
import { formatFileSize, formatDuration } from "@/lib/utils";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const artworkPreview = artworkFile ? URL.createObjectURL(artworkFile) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!audioFile) {
      setError("Please upload an audio file.");
      return;
    }

    setLoading(true);

    try {
      // TODO: Upload files and create project
      const projectId = "new-project-id";
      router.push(`/projects/${projectId}/editor`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold">New Project</h1>
        <p className="text-zinc-400 mt-1">
          Upload your music and artwork to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Give your project a name</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="name"
              label="Project Name"
              placeholder="My Awesome Visualizer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audio</CardTitle>
            <CardDescription>
              Upload an audio file (MP3, WAV, OGG, FLAC)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept="audio/*"
              label="Drop your audio file here"
              description="or click to browse"
              onFileSelect={setAudioFile}
            />
            {audioFile && (
              <div className="mt-4 p-3 rounded-lg bg-surface-2 flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-beatvision-400"
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {audioFile.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatFileSize(audioFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioFile(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artwork</CardTitle>
            <CardDescription>
              Upload your logo or album artwork (PNG, JPG, SVG)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept="image/*"
              label="Drop your artwork here"
              description="or click to browse"
              onFileSelect={setArtworkFile}
            />
            {artworkFile && (
              <div className="mt-4 p-3 rounded-lg bg-surface-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-3 overflow-hidden">
                  <img
                    src={artworkPreview || ""}
                    alt="Artwork preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {artworkFile.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatFileSize(artworkFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setArtworkFile(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!audioFile || loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
