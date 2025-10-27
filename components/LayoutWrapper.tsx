/**
 * Layout Wrapper Component
 *
 * Provides sidebar navigation for dashboard pages
 */

'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './ui/Sidebar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're on a page that should have the sidebar
  const showSidebar = !['/auth', '/', '/documentation', '/privacy', '/terms'].includes(pathname);

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          logo={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-synheart-pink to-synheart-blue flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold text-white">SWIP</div>
                <div className="text-xs text-gray-400">Dashboard</div>
              </div>
            </div>
          }
          sections={[
            {
              title: 'MAIN',
              links: [
                {
                  href: '/leaderboard',
                  label: 'Leaderboard',
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  ),
                },
                {
                  href: '/sessions',
                  label: 'Sessions',
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  ),
                },
                {
                  href: '/developer',
                  label: 'Developer',
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ),
                },
              ],
            },
            {
              title: 'ACCOUNT',
              links: [
                {
                  href: '/profile',
                  label: 'Profile',
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  ),
                },
              ],
            },
          ]}
          footer={
            <div className="text-center text-xs text-gray-500">
              <p>MIT © Synheart AI</p>
              <p className="text-synheart-pink/70 mt-1">for wellness transparency</p>
            </div>
          }
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showSidebar ? 'ml-64' : ''}`}>
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
