import Link from "next/link";

export default function Page() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-synheart-light-gray/40 bg-gradient-to-b from-black/30 to-black/10">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full synheart-gradient opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/2 translate-x-1/2 w-[460px] h-[460px] rounded-full bg-synheart-blue/20 opacity-20 blur-3xl" />

        <div className="relative px-6 py-16 md:py-24 text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl synheart-gradient flex items-center justify-center synheart-glow">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="synheart-gradient-text text-shadow-glow">Synheart</span> Wellness Impact Protocol
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Open-source transparency for wellness apps. Measure impact with HRV and emotion-aware metrics, share results, and climb the SWIP leaderboard.
          </p>
          <div className="flex gap-3 md:gap-4 justify-center pt-2">
            <Link href="/leaderboard" className="synheart-button-primary">
              View Leaderboard
            </Link>
            <Link href="/developer" className="synheart-button-secondary">
              Developer Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="synheart-card p-8 hover:synheart-glow transition-all duration-500 group">
          <div className="w-16 h-16 synheart-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-synheart-pink">Public Transparency</h2>
          <p className="text-gray-300 text-base leading-relaxed mb-6">
            Browse anonymized session data and view the global leaderboard ranking apps by their wellness impact scores.
          </p>
          <Link href="/sessions" className="text-synheart-pink hover:text-synheart-blue transition-colors duration-300 font-medium">
            Explore Sessions →
          </Link>
        </div>

        <div className="synheart-card p-8 hover:synheart-glow transition-all duration-500 group">
          <div className="w-16 h-16 synheart-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-synheart-blue">Developer Integration</h2>
          <p className="text-gray-300 text-base leading-relaxed mb-6">
            Register your wellness app, generate API keys, and submit session data for automatic SWIP evaluation.
          </p>
          <Link href="/developer" className="text-synheart-blue hover:text-synheart-pink transition-colors duration-300 font-medium">
            Get Started →
          </Link>
        </div>

        <div className="synheart-card p-8 hover:synheart-glow transition-all duration-500 group">
          <div className="w-16 h-16 synheart-gradient rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-synheart-pink">Open Science</h2>
          <p className="text-gray-300 text-base leading-relaxed mb-6">
            Reproducible wellness research through open metrics, transparent data structures, and community contributions.
          </p>
          <Link href="/leaderboard" className="text-synheart-pink hover:text-synheart-blue transition-colors duration-300 font-medium">
            View Rankings →
          </Link>
        </div>
      </div>

      {/* API */}
      <div className="synheart-card p-8">
        <h2 className="text-3xl font-bold mb-6 synheart-gradient-text">API Integration</h2>
        <p className="text-gray-300 mb-6 text-lg">
          Submit session data in SWIP format to get automatic wellness impact evaluation:
        </p>
        <div className="bg-synheart-dark rounded-xl p-6 font-mono text-sm overflow-x-auto border border-synheart-light-gray">
          <div className="text-synheart-pink mb-3 font-semibold">POST /api/swip/ingest</div>
          <pre className="text-gray-300">{`{
  "app_id": "your_app_id",
  "session_id": "uuid",
  "metrics": {
    "hr": [72, 75, 73, ...],
    "rr": [0.8, 0.9, 0.7, ...],
    "hrv": {
      "sdnn": 52,
      "rmssd": 48
    },
    "emotion": "calm",
    "timestamp": "2025-10-20T08:00:00Z"
  }
}`}</pre>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Authentication: Include your API key in the <code className="bg-synheart-light-gray px-2 py-1 rounded text-synheart-blue">x-api-key</code> header
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="synheart-card p-6 text-center group hover:synheart-glow transition-all duration-300">
          <div className="text-3xl font-bold synheart-gradient-text mb-2">MIT</div>
          <div className="text-sm text-gray-300">Open Source</div>
        </div>
        <div className="synheart-card p-6 text-center group hover:synheart-glow transition-all duration-300">
          <div className="text-3xl font-bold text-synheart-pink mb-2">100</div>
          <div className="text-sm text-gray-300">Max SWIP Score</div>
        </div>
        <div className="synheart-card p-6 text-center group hover:synheart-glow transition-all duration-300">
          <div className="text-3xl font-bold text-synheart-blue mb-2">30d</div>
          <div className="text-sm text-gray-300">Leaderboard Window</div>
        </div>
        <div className="synheart-card p-6 text-center group hover:synheart-glow transition-all duration-300">
          <div className="text-3xl font-bold synheart-gradient-text mb-2">SOS-1.0</div>
          <div className="text-sm text-gray-300">Privacy Standard</div>
        </div>
      </div>
    </div>
  );
}
