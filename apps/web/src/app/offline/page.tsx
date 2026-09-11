"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-beatvision-500 to-beatvision-700 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">BV</span>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-2 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 2.121a1 1 0 111.414 1.414m2.828-2.829a1 1 0 111.414 1.414M3 12h3m3 0a1 1 0 112 0m5 0a1 1 0 112 0m5 0h1a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h1"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">You're Offline</h1>

        {/* Description */}
        <p className="text-zinc-400 mb-8">
          It looks like you've lost your internet connection. Some features may
          be unavailable while offline.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-beatvision-600 hover:bg-beatvision-700 text-white font-medium rounded-xl transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 bg-surface-2 hover:bg-surface-3 text-zinc-300 font-medium rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-surface-1 rounded-xl text-left">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">
            Offline Tips:
          </h3>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>- Your recent projects are still accessible</li>
            <li>- Changes will sync when you're back online</li>
            <li>- Export requires an internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
