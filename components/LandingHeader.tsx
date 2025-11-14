"use client";
import React from "react";
import Link from "next/link";
import { authClient } from "../src/lib/auth-client";

interface User {
  id: string;
  email: string;
  name?: string;
}

const LandingHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await authClient.getSession();
        const session = result?.data;
        if (session?.user?.id) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.name || undefined,
          });
        }
      } catch (error) {
        console.log("User not authenticated");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getInitials = (user: User) => {
    if (user.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Glassmorphism Header */}
      <header className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <img
                src="/logos/Swip_logo-02.svg"
                alt="SWIP Logo"
                className="h-20 w-auto transform group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/leaderboard"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Leaderboard
              </Link>
              <Link
                href="/sessions"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Sessions
              </Link>
              <Link
                href="/documentation"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Documentation
              </Link>
              <a
                href="https://github.com/synheart-ai/swip-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 .198a8 8 0 00-2.53 15.596c.4.074.547-.174.547-.386 0-.19-.007-.693-.01-1.36-2.226.484-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.727-.497.055-.487.055-.487.804.057 1.227.826 1.227.826.715 1.224 1.874.87 2.33.665.072-.518.28-.87.508-1.07-1.777-.202-3.645-.888-3.645-3.953 0-.873.312-1.588.824-2.148-.083-.202-.357-1.015.078-2.117 0 0 .67-.215 2.197.82a7.66 7.66 0 012.002-.269 7.66 7.66 0 012.002.269c1.526-1.035 2.195-.82 2.195-.82.436 1.102.162 1.915.08 2.117.513.56.823 1.275.823 2.148 0 3.073-1.87 3.748-3.65 3.947.286.246.542.73.542 1.472 0 1.062-.01 1.919-.01 2.18 0 .214.145.463.55.384A8.001 8.001 0 008 .198z" />
                </svg>
                Star on GitHub
              </a>
              <Link
                href="/developer"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Developers
              </Link>
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
              ) : user ? (
                <Link
                  href="/profile"
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all"
                  title={user.name || user.email}
                >
                  {getInitials(user)}
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
                >
                  Sign In
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

           
          </div>
        </div>
      </header>
      {isSidebarOpen && (
              <div className="fixed top-0 left-0 bottom-0 right-0 px-8 py-4  bg-black backdrop-blur-sm z-[9999] ">
                <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
                <div
                  className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-[120px] animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
                <div
                  className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse"
                  style={{ animationDelay: "2s" }}
                />

                {/* navigation mobile */}
                <nav className="flex flex-col gap-4 w-full">
                  <Link
                    href="/"
                    className="text-gray-300 hover:text-white transition-colors text-lg font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="text-gray-300 hover:text-white transition-colors text-lg font-medium"
                  >
                    Leaderboard
                  </Link>
                  <Link
                    href="/sessions"
                    className="text-gray-300 hover:text-white transition-colors text-lg font-medium"
                  >
                    Sessions
                  </Link>
                  <Link
                    href="/documentation"
                    className="text-gray-300 hover:text-white transition-colors text-lg font-medium"
                  >
                    Documentation
                  </Link>
                  {/*                 Star on GitHub
 */}
                <a
                  href="https://github.com/synheart-ai/swip-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 flex items-center gap-2 hover:text-white transition-colors text-lg font-medium"
                >
                      <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 .198a8 8 0 00-2.53 15.596c.4.074.547-.174.547-.386 0-.19-.007-.693-.01-1.36-2.226.484-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.727-.497.055-.487.055-.487.804.057 1.227.826 1.227.826.715 1.224 1.874.87 2.33.665.072-.518.28-.87.508-1.07-1.777-.202-3.645-.888-3.645-3.953 0-.873.312-1.588.824-2.148-.083-.202-.357-1.015.078-2.117 0 0 .67-.215 2.197.82a7.66 7.66 0 012.002-.269 7.66 7.66 0 012.002.269c1.526-1.035 2.195-.82 2.195-.82.436 1.102.162 1.915.08 2.117.513.56.823 1.275.823 2.148 0 3.073-1.87 3.748-3.65 3.947.286.246.542.73.542 1.472 0 1.062-.01 1.919-.01 2.18 0 .214.145.463.55.384A8.001 8.001 0 008 .198z" />
                </svg>
                  Star on GitHub
                </a>
                  <Link
                    href="/developer"
                    className="text-gray-300 hover:text-white transition-colors text-lg font-medium"
                  >
                    Developers
                  </Link>
                  {loading ? (
                    <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
                  ) : user ? (
                    <Link
                      href="/profile"
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all"
                      title={user.name || user.email}
                    >
                      {getInitials(user)}
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      className="w-fit  bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all px-12 py-2.5 rounded-lg"
                    >
                      Sign In
                    </Link>
                  )}
                </nav>
                {/* close button */}
                <button
                  className="absolute top-6 right-8 text-gray-400 hover:text-white"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
    </>
  );
};

export default LandingHeader;
