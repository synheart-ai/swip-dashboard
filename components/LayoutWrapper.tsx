/**
 * Layout Wrapper Component
 *
 * Provides sidebar navigation for dashboard pages with responsive design
 */

'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from './ui/Sidebar';
import { DashboardHeader } from './DashboardHeader';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Check if we're on a page that should have the sidebar
  const pagesWithoutSidebar = ['/auth', '/', '/documentation', '/privacy', '/terms'];
  const showSidebar = !pagesWithoutSidebar.includes(pathname);

  useEffect(() => {
    setMounted(true);
    
    // Load saved collapse state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Save collapse state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }
  }, [isCollapsed, mounted]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  // For pages without sidebar, don't apply layout wrapper styles
  if (!showSidebar) {
    return <>{children}</>;
  }

  // Prevent flash during hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          onToggleCollapse={toggleCollapse}
          onCloseMobile={closeMobileMenu}
          logo={
            <Link href="/" className="flex items-center group">
              <img
                src="/logos/Swip_logo-02.svg"
                alt="SWIP Logo"
                className="h-10 scale-125 w-auto transform group-hover:scale-105 transition-transform"
              />
            </Link>
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
                  href: '/apps',
                  label: 'Apps',
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        showSidebar ? (isCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''
      }`}>
        {/* Mobile Header - Hamburger menu and user profile */}
        {showSidebar && (
          <div className="lg:hidden sticky top-0 z-30 bg-gray-950 border-b border-gray-800">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <Link href="/" className="flex items-center">
                  <img
                    src="/logos/Swip_logo-02.svg"
                    alt="SWIP Logo"
                    className="h-12 w-auto"
                  />
                </Link>
              </div>
              {/* Mobile User Profile - Compact mode (avatar only) */}
              <DashboardHeader compact={true} />
            </div>
          </div>
        )}

        {/* Dashboard Header - Desktop only, with user profile */}
        {showSidebar && (
          <DashboardHeader className="hidden lg:block" />
        )}
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
