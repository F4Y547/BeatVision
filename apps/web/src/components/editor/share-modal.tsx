"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function ShareModal({ isOpen, onClose, projectId, projectName }: ShareModalProps) {
  const [shareLink, setShareLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [permissions, setPermissions] = useState<"view" | "comment" | "edit">("view");
  const [expiresIn, setExpiresIn] = useState<string>("7d");

  const generateLink = async () => {
    setIsGenerating(true);
    
    // TODO: Generate actual share link
    await new Promise((r) => setTimeout(r, 1000));
    
    const mockLink = `https://beatvision.app/review/${projectId.substring(0, 8)}`;
    setShareLink(mockLink);
    setIsGenerating(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Share "{projectName}"</CardTitle>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permissions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Permission Level</label>
            <div className="flex gap-2">
              {(["view", "comment", "edit"] as const).map((perm) => (
                <button
                  key={perm}
                  onClick={() => setPermissions(perm)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    permissions === perm
                      ? "bg-beatvision-600 border-beatvision-500 text-white"
                      : "bg-surface-2 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {perm}
                </button>
              ))}
            </div>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Link Expires In</label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="never">Never</option>
            </select>
          </div>

          {/* Generate Link */}
          {!shareLink ? (
            <Button
              className="w-full"
              onClick={generateLink}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Review Link"}
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
                <Button variant="secondary" onClick={copyLink}>
                  Copy
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                Anyone with this link can {permissions} this project
              </p>
            </div>
          )}

          {/* Email Invite */}
          <div className="pt-4 border-t border-white/5">
            <label className="text-sm font-medium text-zinc-300 mb-2 block">
              Or invite by email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="colleague@example.com"
                className="flex-1 bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500"
              />
              <Button variant="secondary" size="sm">
                Invite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
