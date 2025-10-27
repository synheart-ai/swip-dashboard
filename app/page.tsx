/**
 * Landing Page
 *
 * Main landing page for SWIP Dashboard - Public page
 */

import Link from "next/link";
import { getStatistics } from "../lib/statistics";
import { RegionalActivity } from "../components/RegionalActivity";
import { DeviceDistribution } from "../components/DeviceDistribution";
import { StatsCard } from "../components/ui/StatsCard";

export default async function Page() {
  const stats = await getStatistics();
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[5%] left-[25%] w-[1116px] h-[1116px] bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-[10%] right-[15%] w-[1116px] h-[1116px] bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-[40%] left-[10%] w-[866px] h-[866px] bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[25%] w-[954px] h-[954px] bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[20%] w-[749px] h-[749px] bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img
                src="/swip-logo.svg"
                alt="SWIP Logo"
                className="h-12 w-auto"
              />
            </Link>

            {/* Sign In Button */}
            <Link href="/auth" className="border-2 border-[#7a40fd] rounded-full px-8 py-2 text-white text-sm font-semibold hover:bg-[#7a40fd]/10 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center pt-24 pb-20">
         
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white to-white/20" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Synheart Wellness Impact Protocol
          </h1>
          <p className="text-white/50 text-lg max-w-[655px] mx-auto mb-8">
            Open-source transparency for wellness apps. Measure impact with HRV and emotion-aware metrics, share results, and climb the SWIP leaderboard.
          </p>
          <Link href="/leaderboard" className="inline-block border-[3px] border-[#7a40fd] rounded-full px-16 py-4 text-white text-xl font-semibold hover:bg-[#7a40fd]/10 transition-colors">
            View Leaderboard
          </Link>
        </div>

        {/* Main Features Section */}
        <div className="mb-20">
          <h2 className="text-center text-white text-[21px] font-semibold mb-8">Main Features</h2>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent rounded-[6px] h-[67px] top-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="text-center">
                <div className="w-[72px] h-[72px] rounded-[12px] bg-[rgba(254,34,177,0.2)] flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-white text-2xl font-semibold mb-4">Public Transparency</h3>
                <p className="text-[#73787a] text-sm leading-relaxed">
                  Browse anonymized session data and view the global leaderboard ranking apps by their wellness impact scores.
                </p>
              </div>

              <div className="text-center md:border-l md:border-r border-white/10 md:px-8">
                <div className="w-[72px] h-[72px] rounded-[12px] bg-[rgba(254,34,177,0.2)] flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-white text-2xl font-semibold mb-4">Developer Integration</h3>
                <p className="text-[#73787a] text-sm leading-relaxed">
                  Register your wellness app, generate API keys, and submit session data for automatic SWIP evaluation.
                </p>
              </div>

              <div className="text-center">
                <div className="w-[72px] h-[72px] rounded-[12px] bg-[rgba(254,34,177,0.2)] flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white text-2xl font-semibold mb-4">Open Science</h3>
                <p className="text-[#73787a] text-sm leading-relaxed">
                  Reproducible wellness research through open metrics, transparent data structures, and community contributions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API Integration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Code Preview */}
          <div className="bg-black/40 rounded-lg p-8 font-mono text-sm border border-white/10">
            <div className="text-[#fe22b1] mb-4 font-semibold">API Integration</div>
            <pre className="text-gray-400 leading-relaxed overflow-x-auto">
{`const session = {
  appId: "wellness_app_001",
  userId: "user_12345",
  metrics: {
    heartRate: [72, 75, 73, 70, 68],
    hrv: {
      sdnn: 52.3,
      rmssd: 48.1
    },
    emotion: "calm",
    timestamp: new Date().toISOString()
  }
};

const response = await fetch(
  "https://api.swip.dev/v1/sessions",
  {
    method: "POST",
    headers: {
      "x-api-key": process.env.SWIP_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(session)
  }
);`}</pre>
          </div>

          {/* API Description */}
          <div className="flex flex-col justify-center">
            <h2 className="text-5xl lg:text-6xl font-semibold leading-tight text-white mb-6">
              Developer Friendly API
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              Submit biometric data and digital behavior patterns through our simple REST API. Automatically calculate SWIP scores, track wellness trends, and receive real-time insights. Integrate with Spotify listening habits, Apple Health metrics, YouTube watch time, TikTok engagement, and Amazon purchase patterns to build the next generation of lifestyle intelligence apps.
            </p>
            <Link href="/documentation" className="inline-block border-[3px] border-[#7a40fd] rounded-full px-12 py-3 text-white text-lg font-semibold hover:bg-[#7a40fd]/10 transition-colors w-fit">
              View Documentation
            </Link>
          </div>
        </div>

        {/* Dashboard Overview Section */}
        <div className="mb-20 bg-gradient-to-b from-gray-900/30 to-gray-800/10 rounded-[20px] p-12 border border-white/5">
          <p className="text-[#fe22b1] text-xl font-medium mb-6">Your dashboard overview</p>
          <h3 className="text-white text-4xl lg:text-5xl font-medium leading-tight mb-8 max-w-[580px]">
            Open-source transparency for wellness apps. Measure impact with HRV
          </h3>
          <Link href="/developer" className="inline-block border-[3px] border-[#7a40fd] rounded-full px-12 py-3 text-white text-lg font-semibold hover:bg-[#7a40fd]/10 transition-colors">
            Developer Portal
          </Link>
        </div>

        {/* Feature Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-purple-900/20 rounded-lg p-8 border border-blue-400/30 relative overflow-hidden">
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-pink-400 text-2xl font-semibold mb-4">Biometric Intelligence</h3>
              <p className="text-pink-300 text-sm leading-relaxed">
                Leverage HRV and heart rate data to understand stress patterns, recovery states, and emotional well-being. Our AI identifies correlations between your biometrics and daily activities across all connected platforms.
              </p>
            </div>
          </div>

          <div className="bg-blue-900/20 rounded-lg p-8 border border-blue-400/30 relative overflow-hidden">
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-cyan-400 text-2xl font-semibold mb-4">Behavioral Insights</h3>
              <p className="text-cyan-300 text-sm leading-relaxed">
                Discover how your Spotify playlists, YouTube viewing habits, TikTok engagement, and Amazon purchases impact your wellness. Get personalized recommendations for healthier digital behavior patterns.
              </p>
            </div>
          </div>
        </div>

        {/* System Analytics Dashboard */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">System Analytics</h2>
            <p className="text-gray-400 text-lg">Comprehensive analytics and insights across the SWIP platform</p>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard
              title="Total API Calls"
              value={stats.totalApiCalls}
              icon="chart"
              color="pink"
              trend={{
                value: parseInt(stats.apiCallsGrowth),
                label: "This Month",
                positive: true,
              }}
            />
            <StatsCard
              title="Active Developers"
              value={stats.activeUsers}
              icon="users"
              color="blue"
              trend={{
                value: 8,
                label: "New This Week",
                positive: true,
              }}
            />
            <StatsCard
              title="Data Processing"
              value={stats.dataProcessingUptime}
              icon="check"
              color="green"
              trend={{
                value: parseFloat(stats.uptimeImprovement),
                label: "Uptime",
                positive: true,
              }}
            />
            <StatsCard
              title="Avg Response Time"
              value={stats.avgResponseTime}
              icon="clock"
              color="purple"
              trend={{
                value: parseInt(stats.responseTimeImprovement),
                label: "Improvement",
                positive: true,
              }}
            />
          </div>
          
          {/* Regional and Device Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RegionalActivity data={stats.regionalActivity} />
            <DeviceDistribution data={stats.deviceDistribution} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 py-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white text-sm">© 2025 Synheart AI. All rights reserved.</p>
            <p className="text-gray-500 text-sm">
              Built with <span className="text-[#fe22b1]">❤</span> for wellness transparency
            </p>
            <div className="flex items-center gap-6">
              <Link href="/documentation" className="text-white text-sm hover:text-pink-500 transition-colors">
                Documentation
              </Link>
              <Link href="/terms" className="text-white text-sm hover:text-pink-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-white text-sm hover:text-pink-500 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
