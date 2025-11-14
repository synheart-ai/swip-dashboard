/**
 * Modern Landing Page
 * 
 * Ultra-modern, premium landing page with glassmorphism and animations
 */
import Link from "next/link";
import { getStatistics } from "../lib/statistics";
import { StatsCard } from "../components/ui/StatsCard";
import { ApiSlider } from "../components/ApiSlider";
import LandingHeader from "@/components/LandingHeader";

export default async function Page() {
  const stats = await getStatistics();

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0118] via-[#0D0221] to-[#0A0118] text-white overflow-hidden">
      {/* Animated Background Effects */}
      <LandingHeader />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center pt-20 pb-16 min-h-screen flex flex-col items-center justify-center">
          {/* Badge */}
          <div className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 text-sm font-medium">Open-Source Wellness Intelligence</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl lg:text-8xl font-bold  md:leading-tight mb-6">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white">
              Synheart Wellness
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
              Impact Protocol
            </span>
          </h1>

          {/* Subtitle */}
          <p className="md:text-xl text-base text-gray-300 md:max-w-3xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Measure real wellness impact with HRV and emotion-aware metrics. The SWIP Dashboard pairs a public transparency layer with the
            <strong className="text-purple-200"> SWIP Flutter SDK</strong> and <strong className="text-purple-200">Synheart Wear SDK</strong> so you can build production wellness apps, ingest biosignals, and certify outcomes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/leaderboard" 
              className="px-8 py-4 w-full md:w-auto rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all transform hover:scale-105"
            >
              View Global Leaderboard
            </Link>
            <Link 
              href="/developer" 
              className="px-8 py-4 w-full md:w-auto rounded-lg border border-gray-700 bg-gray-800/50 text-white font-semibold hover:bg-gray-700/50 transition-all backdrop-blur-sm"
            >
              Register Your App
            </Link>
            <a 
              href="https://github.com/synheart-ai/swip"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 w-full md:w-auto rounded-lg border border-purple-600/40 text-purple-200 hover:bg-purple-600/10 transition-all backdrop-blur-sm font-semibold"
            >
              Explore the Flutter SWIP SDK
            </a>
          </div>

          {/* Social Proof Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-400">{stats.sessionsTracked} Sessions Tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-gray-400">{stats.activeUsers} Developers</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-400">Open Source</span>
            </div>
          </div>
        </div>

        {/* SDK Promo */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/10 md:p-12 p-6 md:mb-20 mb-8 backdrop-blur-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_60%)]" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span className="text-purple-200 text-sm font-medium">Build with the Flutter SDK</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ship Wellness Apps with Synheart Tooling
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                The open-source <strong>SWIP Flutter SDK</strong> packages biosignals, sessions, and emotions for ingestion. 
                Pair it with the <strong>Synheart Wear SDK</strong> to collect data from popular wearables and unlock verified ingestion once your app is approved.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Declarative Flutter APIs for sessions, scoring, and ingestion.
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Synheart Wear plugin streaming Apple Watch, Fitbit, Garmin, Whoop, and more.
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified ingestion keys mapped to your external app ID.
                </li>
              </ul>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <a
                  href="https://github.com/synheart-ai/swip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full md:w-fit items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
                >
                  View Flutter SDK on GitHub
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="https://github.com/synheart-ai/synheart-wear"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full md:w-fit items-center gap-2 px-6 py-3 rounded-lg border border-purple-600/40 text-purple-200 hover:bg-purple-600/10 transition-all"
                >
                  Synheart Wear SDK
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent blur-3xl" />
              <div className="relative h-full w-full rounded-2xl border border-purple-500/20 bg-black/30 p-8">
                <h3 className="text-white text-xl font-semibold mb-4">Flutter Quick Start (SWIP)</h3>
                <pre className="text-xs md:text-sm text-purple-100 font-mono leading-relaxed overflow-x-auto bg-black/40 rounded-lg p-6 border border-purple-500/10">
{`import 'package:swip/swip.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final swip = SWIPManager();
  await swip.initialize();

  final sessionId = await swip.startSession(
    config: const SWIPSessionConfig(
      duration: Duration(minutes: 30),
      type: 'baseline',
      platform: 'flutter',
      environment: 'indoor',
    ),
  );

  final results = await swip.endSession();
  debugPrint('Wellness Impact Score: \${results.wellnessScore}');
}`}
                </pre>
                <p className="text-gray-400 text-sm mt-4">
                  Request ingestion access in the developer portal to receive your ingestion key and unlock the full Flutter + Synheart Wear pipeline.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SDK Highlight */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-slate-900/40 to-pink-900/20 p-6 md:p-16 md:mb-20 mb-8 backdrop-blur-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.25),transparent_55%)]" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-6 gap-12 ">
            <div className="col-span-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6 w-fit">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-purple-200 text-sm font-medium">Open Source Flutter Ecosystem</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Build with the SWIP SDK & Synheart Wear
              </h2>
              <p className="text-gray-300  leading-relaxed mb-6">
                Our Flutter-first SDK stack lets you stream biosignals from wearables, compute SWIP scores, and deliver verified ingestion directly to the dashboard. Ready-to-use widgets, validation helpers, and certification tooling make wellness-grade telemetry achievable in days, not months.
              </p>

              <div className="grid grid-cols-1 mt-6  gap-3 mb-4">
                <div className="rounded-2xl border border-purple-500/20 bg-black/30 p-5">
                  <h3 className="text-white font-semibold mb-2">SWIP Flutter SDK</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Flutter package with Bloc-friendly APIs, session lifecycle helpers, and SWIP certification workflows.
                  </p>
                  <a
                    href="https://github.com/synheart-ai/swip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-purple-200 mt-4 hover:text-white transition-colors"
                  >
                    Visit repository
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-black/30 p-5">
                  <h3 className="text-white font-semibold mb-2">Synheart Wear SDK</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Flutter plugin that abstracts BLE/Web APIs for Apple Watch, Fitbit, Garmin, Whoop, and more—streamlined into the SWIP pipeline.
                  </p>
                  <a
                    href="https://github.com/synheart-ai/synheart-wear"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-200 mt-4 hover:text-white transition-colors"
                  >
                    Explore adapters
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
                <a
                  href="https://github.com/synheart-ai/swip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center w-full md:w-auto gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
                >
                  Get started with the SDK
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="https://github.com/synheart-ai/swip-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center w-full md:w-auto gap-2 px-6 py-3 rounded-lg border border-purple-500/40 text-purple-200 hover:bg-purple-600/10 transition-all"
                >
                  Star the dashboard repo
                  <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .198a8 8 0 00-2.53 15.596c.4.074.547-.174.547-.386 0-.19-.007-.693-.01-1.36-2.226.484-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.727-.497.055-.487.055-.487.804.057 1.227.826 1.227.826.715 1.224 1.874.87 2.33.665.072-.518.28-.87.508-1.07-1.777-.202-3.645-.888-3.645-3.953 0-.873.312-1.588.824-2.148-.083-.202-.357-1.015.078-2.117 0 0 .67-.215 2.197.82a7.66 7.66 0 012.002-.269 7.66 7.66 0 012.002.269c1.526-1.035 2.195-.82 2.195-.82.436 1.102.162 1.915.08 2.117.513.56.823 1.275.823 2.148 0 3.073-1.87 3.748-3.65 3.947.286.246.542.73.542 1.472 0 1.062-.01 1.919-.01 2.18 0 .214.145.463.55.384A8.001 8.001 0 008 .198z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="relative h-full col-span-3">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/15 to-transparent blur-3xl" />
              <div className="relative rounded-2xl border border-purple-500/20 bg-black/40 p-8">
                <h3 className="text-gray-100 text-xl font-semibold mb-4">Synheart Wear Streaming</h3>
                <pre className="text-xs md:text-sm text-purple-100 font-mono leading-relaxed overflow-x-auto bg-black/60 rounded-lg p-6 border border-purple-500/10">
{`import 'package:synheart_wear/synheart_wear.dart';

Future<void> startWearStream() async {
  final synheart = SynheartWear();
  await synheart.initialize();

  // Read current metrics
  final metrics = await synheart.readMetrics();
  debugPrint('Heart Rate: \${metrics.getMetric(MetricType.hr)}');

  // Stream heart rate data every 5 seconds
  synheart.streamHR(interval: const Duration(seconds: 5)).listen((packet) {
    final hr = packet.getMetric(MetricType.hr);
    debugPrint('Current HR: \$hr');
  });

  // Stream HRV data windows
  synheart.streamHRV(windowSize: const Duration(seconds: 5)).listen((packet) {
    final hrv = packet.getMetric(MetricType.hrvRmssd);
    debugPrint('HRV RMSSD: \$hrv');
  });
}`}
                </pre>
                <p className="text-gray-400 text-sm mt-4">
                  Synheart Wear streams biosignals directly into the SWIP Flutter SDK so your app can publish verified telemetry in real time.
                </p>
              </div>
            </div>
          </div>
         
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:mb-20 mb-8">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 p-8 backdrop-blur-sm hover:border-purple-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Public Transparency</h3>
              <p className="text-gray-400 leading-relaxed">
                Browse anonymized session data and view the global leaderboard ranking apps by their wellness impact scores.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 p-8 backdrop-blur-sm hover:border-pink-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Developer Integration</h3>
              <p className="text-gray-400 leading-relaxed">
                Register your wellness app, generate API keys, and submit session data for automatic SWIP evaluation.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Open Science</h3>
              <p className="text-gray-400 leading-relaxed">
                Reproducible wellness research through open metrics, transparent data structures, and community contributions.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <ApiSlider />
        </div>

        {/* Platform Statistics */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Platform Analytics
            </h2>
            <p className="text-gray-400 text-lg">
              Real-time insights across the SWIP ecosystem
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total API Calls"
              value={stats.totalApiCalls}
              icon="chart"
              color="pink"
              trend={{
                value: parseFloat(stats.apiCallsGrowth.replace('%', '')),
                label: "This Month",
                positive: parseFloat(stats.apiCallsGrowth.replace('%', '')) >= 0,
              }}
            />
            <StatsCard
              title="Active Developers"
              value={stats.activeUsers}
              icon="users"
              color="blue"
              trend={{
                value: parseFloat(stats.uptimeImprovement.replace('%', '')),
                label: "Growth",
                positive: parseFloat(stats.uptimeImprovement.replace('%', '')) >= 0,
              }}
            />
            <StatsCard
              title="System Uptime"
              value={stats.dataProcessingUptime}
              icon="check"
              color="green"
              trend={{
                value: parseFloat(stats.uptimeImprovement.replace('%', '')),
                label: "Reliability",
                positive: true,
              }}
            />
            <StatsCard
              title="Response Time"
              value={stats.avgResponseTime}
              icon="clock"
              color="purple"
              trend={{
                value: parseInt(stats.responseTimeImprovement.replace('%', '')),
                label: "Faster",
                positive: true,
              }}
            />
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-12 md:p-16 md:mb-20 mb-8 backdrop-blur-sm">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Build the Future
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                of Wellness Apps?
              </span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of developers building transparent, data-driven wellness applications.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/developer" 
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all"
              >
                Register Your App
              </Link>
              <Link 
                href="/leaderboard" 
                className="px-8 py-4 rounded-lg border border-gray-700 bg-gray-800/50 text-white font-semibold hover:bg-gray-700/50 transition-all"
              >
                Explore Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <img
                  src="/logos/Swip_logo-04.svg"
                  alt="SWIP Logo"
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Open-source wellness intelligence for the modern age.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/leaderboard" className="text-gray-400 hover:text-white text-sm transition-colors">Leaderboard</Link></li>
                <li><Link href="/sessions" className="text-gray-400 hover:text-white text-sm transition-colors">Sessions</Link></li>
                <li><Link href="/analytics" className="text-gray-400 hover:text-white text-sm transition-colors">Analytics</Link></li>
                <li>
                  <a
                    href="https://github.com/synheart-ai/swip-dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                  >
                    GitHub Repo
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M8 .198a8 8 0 00-2.53 15.596c.4.074.547-.174.547-.386 0-.19-.007-.693-.01-1.36-2.226.484-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.727-.497.055-.487.055-.487.804.057 1.227.826 1.227.826.715 1.224 1.874.87 2.33.665.072-.518.28-.87.508-1.07-1.777-.202-3.645-.888-3.645-3.953 0-.873.312-1.588.824-2.148-.083-.202-.357-1.015.078-2.117 0 0 .67-.215 2.197.82a7.66 7.66 0 012.002-.269 7.66 7.66 0 012.002.269c1.526-1.035 2.195-.82 2.195-.82.436 1.102.162 1.915.08 2.117.513.56.823 1.275.823 2.148 0 3.073-1.87 3.748-3.65 3.947.286.246.542.73.542 1.472 0 1.062-.01 1.919-.01 2.18 0 .214.145.463.55.384A8.001 8.001 0 008 .198z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-2">
                <li><Link href="/developer" className="text-gray-400 hover:text-white text-sm transition-colors">Portal</Link></li>
                <li><Link href="/documentation" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</Link></li>
                <li><Link href="/developer" className="text-gray-400 hover:text-white text-sm transition-colors">API Keys</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">SDK & Tools</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com/synheart-ai/swip" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                    SWIP SDK
                  </a>
                </li>
                <li>
                  <a href="https://github.com/synheart-ai/synheart-wear" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Synheart Wear
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              © 2025 Synheart AI. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Built with <span className="text-pink-400">❤</span> for wellness transparency
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
