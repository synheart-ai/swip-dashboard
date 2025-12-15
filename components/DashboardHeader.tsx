/**
 * Dashboard Header Component
 *
 * Top navigation bar with user profile and account management
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '../src/lib/auth-client';

interface DashboardHeaderProps {
  className?: string;
  compact?: boolean; // For mobile - only show user avatar
}

export function DashboardHeader({ className = '', compact = false }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  // Get user initials for avatar
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const user = session?.user;
  const initials = getInitials(user?.name, user?.email);

  // Compact mode - only render the user profile dropdown (for mobile)
  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {/* User Avatar Circle */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {initials}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden">
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Profile Settings</span>
              </Link>

              <Link
                href="/developer"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Developer Portal</span>
              </Link>

              <div className="border-t border-gray-700 my-2" />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full header mode (for desktop)
  return (
    <header className={`sticky top-0 z-40 bg-gray-950 border-b border-gray-800 ${className}`}>
      <div className="flex items-center justify-between h-16 px-6">
        {/* Page Title / Breadcrumb Area */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        </div>

        {/* Right Side - User Profile */}
        <div className="flex items-center gap-4">
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {/* User Avatar Circle */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {initials}
              </div>
              
              {/* User Info (hidden on mobile) */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.email}
                </p>
              </div>

              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden">
                {/* User Info Header */}
                <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">Profile Settings</span>
                  </Link>

                  <Link
                    href="/developer"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">Developer Portal</span>
                  </Link>

                  <div className="border-t border-gray-700 my-2" />

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

