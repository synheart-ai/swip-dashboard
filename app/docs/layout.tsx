import type { ReactNode } from 'react';
import { source } from '../../lib/source';
import Link from 'next/link';
import { DocsNavigation } from './components/DocsNavigation';
import { DocsSearch } from './components/DocsSearch';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/logos/Swip_logo-02.svg" 
                alt="SWIP" 
                className="h-10 w-auto"
              />
              <span className="hidden sm:inline font-semibold text-lg text-white">
                Documentation
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <DocsSearch />
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Home
              </Link>
              <Link 
                href="/leaderboard" 
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/developer" 
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Developer
              </Link>
              <a 
                href="https://github.com/synheart-ai/swip-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <DocsNavigation tree={source.pageTree} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <img src="/logos/swip-fav.png" alt="SWIP" className="h-5 w-5" />
              <span>© 2025 Synheart AI. MIT License.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/docs/privacy" className="text-gray-400 hover:text-pink-400 transition-colors">
                Privacy
              </Link>
              <Link href="/docs/terms" className="text-gray-400 hover:text-pink-400 transition-colors">
                Terms
              </Link>
              <a 
                href="mailto:support@swip.synheart.io" 
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
