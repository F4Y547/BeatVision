import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-beatvision-500 to-beatvision-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">BV</span>
          </div>
          <span className="text-lg md:text-xl font-bold">BeatVision</span>
        </div>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link
            href="/login"
            className="text-zinc-400 hover:text-white transition-colors text-sm md:text-base"
          >
            Sign in
          </Link>
          <Link href="/register" className="btn-primary text-sm md:text-base px-3 md:px-4 py-2">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-beatvision-500/10 border border-beatvision-500/20 text-beatvision-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-beatvision-400 animate-pulse" />
            Now in beta
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
            Your music.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-beatvision-400 to-beatvision-600">
              Your artwork.
            </span>
            <br />
            Moving together.
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto text-balance">
            Upload your music and artwork. BeatVision transforms them into
            synchronized, real-time visual experiences. No motion graphics
            skills required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary text-lg px-8 py-3"
            >
              Start Creating Free
            </Link>
            <Link
              href="#features"
              className="btn-ghost text-lg px-8 py-3"
            >
              See Features
            </Link>
          </div>
        </div>

        <div className="mt-20 w-full max-w-5xl">
          <div className="relative aspect-video rounded-2xl bg-surface-1 border border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-beatvision-600/10 via-transparent to-purple-600/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-2 border border-white/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-beatvision-400"
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
                <p className="text-zinc-500">
                  Editor preview — Upload music and artwork to begin
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-4 md:px-6 py-6 border-t border-white/5 text-center text-zinc-500 text-sm">
        BeatVision — Advanced Real-Time Music Visualizer
      </footer>
    </div>
  );
}
