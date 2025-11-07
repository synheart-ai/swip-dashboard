"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "../../src/lib/auth-client";

export default function AuthPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/developer",
      });
    } catch (error) {
      console.error(`${provider} sign-in failed:`, error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[800px] h-[800px] bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[20%] w-[800px] h-[800px] bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md mx-auto px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <img
            src="/logos/Swip_logo-05.svg"
            alt="SWIP Logo"
            className="h-24 w-auto"
          />
        </Link>

        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Sign In to SWIP
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Access the developer dashboard and manage your wellness apps
        </p>

        <div className="backdrop-blur-[88px] bg-gradient-to-b from-[rgba(26,26,26,0.5)] to-[rgba(42,41,41,0.3)] rounded-[20px] p-8 border border-white/10">
          <div className="space-y-4">
            <button
              onClick={() => handleSocialSignIn("google")}
              disabled={loading === "google"}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "google" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading === "google" ? "Signing in..." : "Continue with Google"}
            </button>

            <button
              onClick={() => handleSocialSignIn("github")}
              disabled={loading === "github"}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "github" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              {loading === "github" ? "Signing in..." : "Continue with GitHub"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-gray-400">
            <p>By signing in, you agree to our <Link href="/terms" className="text-synheart-pink hover:underline">terms of service</Link> and <Link href="/privacy" className="text-synheart-pink hover:underline">privacy policy</Link>.</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link className="text-gray-400 hover:text-synheart-pink transition-colors inline-flex items-center gap-2" href="/">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
