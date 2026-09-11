"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
}

interface CollaborationPanelProps {
  collaborators: Collaborator[];
  isHost: boolean;
  onInvite?: () => void;
  onRemoveUser?: (userId: string) => void;
}

export function CollaborationPanel({
  collaborators,
  isHost,
  onInvite,
  onRemoveUser,
}: CollaborationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-beatvision-500 flex items-center justify-center text-[10px] font-medium text-white">
              You
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-surface-1" />
          </div>
          <span className="text-sm font-medium text-white">
            {collaborators.length + 1} online
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-white"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              isExpanded ? "" : "-rotate-90"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Collaborators */}
      {isExpanded && (
        <>
          <div className="space-y-2">
            {collaborators.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-2"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface-1 ${
                        user.isActive ? "bg-green-500" : "bg-zinc-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-white">{user.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {user.isActive ? "Editing" : "Idle"}
                    </p>
                  </div>
                </div>
                {isHost && onRemoveUser && (
                  <button
                    onClick={() => onRemoveUser(user.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Invite button */}
          {isHost && onInvite && (
            <button
              onClick={onInvite}
              className="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-zinc-400 hover:text-white hover:border-white/40 transition-colors"
            >
              + Invite Collaborator
            </button>
          )}

          {/* Connection info */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Real-time sync active</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// Remote cursor overlay
export function RemoteCursors({
  collaborators,
  containerRef,
}: {
  collaborators: Collaborator[];
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <>
      {collaborators
        .filter((c) => c.cursor && c.isActive)
        .map((user) => (
          <div
            key={user.id}
            className="absolute pointer-events-none z-50 transition-all duration-100"
            style={{
              left: `${user.cursor!.x}%`,
              top: `${user.cursor!.y}%`,
            }}
          >
            {/* Cursor */}
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              className="drop-shadow-lg"
            >
              <path
                d="M0 0L16 12L8 12L4 20L0 0Z"
                fill={user.color}
              />
              <path
                d="M0 0L16 12L8 12L4 20L0 0Z"
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            {/* Name tag */}
            <div
              className="absolute left-4 top-4 px-2 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        ))}
    </>
  );
}

// Selection highlight for remote users
export function RemoteSelection({
  collaborator,
  bounds,
}: {
  collaborator: Collaborator;
  bounds: { x: number; y: number; width: number; height: number };
}) {
  return (
    <div
      className="absolute pointer-events-none border-2 rounded"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        borderColor: collaborator.color,
        backgroundColor: `${collaborator.color}20`,
      }}
    >
      <div
        className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: collaborator.color }}
      >
        {collaborator.name}
      </div>
    </div>
  );
}
