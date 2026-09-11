"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/upload/file-upload";
import { formatFileSize } from "@/lib/utils";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

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
      // 1. Create project
      setUploadProgress("Creating project...");
      const projectRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!projectRes.ok) {
        const data = await projectRes.json();
        throw new Error(data.error || "Failed to create project");
      }

      const { project } = await projectRes.json();

      // 2. Upload audio file
      setUploadProgress("Uploading audio...");
      const audioFormData = new FormData();
      audioFormData.append("file", audioFile);
      audioFormData.append("type", "audio");
      audioFormData.append("projectId", project.id);

      const audioRes = await fetch("/api/assets", {
        method: "POST",
        body: audioFormData,
      });

      if (!audioRes.ok) {
        const data = await audioRes.json();
        throw new Error(data.error || "Failed to upload audio");
      }

      // 3. Upload artwork if provided
      if (artworkFile) {
        setUploadProgress("Uploading artwork...");
        const imageFormData = new FormData();
        imageFormData.append("file", artworkFile);
        imageFormData.append("type", "image");
        imageFormData.append("projectId", project.id);

        const imageRes = await fetch("/api/assets", {
          method: "POST",
          body: imageFormData,
        });

        if (!imageRes.ok) {
          console.warn("Artwork upload failed, continuing without it");
        }
      }

      // 4. Navigate to editor
      setUploadProgress("Opening editor...");
      router.push(`/projects/${project.id}/editor`);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
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
                  className="w-8 h-8 text-beatvision-400 shrink-0"
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
                  className="text-zinc-500 hover:text-white shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
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
              Upload your logo or album artwork (PNG, JPG, SVG) — optional
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
                <div className="w-12 h-12 rounded-lg bg-surface-3 overflow-hidden shrink-0">
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
                  className="text-zinc-500 hover:text-white shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
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

        {loading && uploadProgress && (
          <div className="p-3 rounded-lg bg-beatvision-500/10 border border-beatvision-500/20 text-beatvision-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {uploadProgress}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={loading}
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
