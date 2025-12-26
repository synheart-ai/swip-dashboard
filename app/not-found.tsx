'use client';

/**
 * 404 Not Found Page
 * 
 * This is a standalone page that renders without the dashboard layout
 */

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  // Hide sidebar on mount
  useEffect(() => {
    // Hide the parent layout elements
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    const wrapper = document.querySelector('[class*="lg:ml-"]');
    
    if (sidebar) sidebar.style.display = 'none';
    if (header) header.style.display = 'none';
    if (wrapper) wrapper.className = wrapper.className.replace(/lg:ml-\d+/g, '');
    
    // Cleanup on unmount
    return () => {
      if (sidebar) sidebar.style.display = '';
      if (header) header.style.display = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 px-4 z-[9999]">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-block">
            <img 
              src="/logos/Swip_logo-02.svg" 
              alt="SWIP" 
              className="h-12 w-auto mx-auto hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* 404 Animation */}
        <div className="mb-8 relative">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 -z-10" />
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-pink-500/30 hover:scale-105"
          >
            Go Home
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 bg-gray-800/50 text-white rounded-xl font-medium hover:bg-gray-700/50 transition-all border border-gray-700 hover:border-gray-600"
          >
            View Docs
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Help Links */}
        <div className="mt-8 text-sm text-gray-500">
          <span>Need help? </span>
          <a href="mailto:support@swip.synheart.io" className="text-cyan-400 hover:text-pink-400 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
