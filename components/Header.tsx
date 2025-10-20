"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by making a request to get current user
    const checkAuth = async () => {
      // Check if user has logged out (stored in localStorage)
      const isLoggedOut = localStorage.getItem('swip_logged_out') === 'true';
      if (isLoggedOut) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // For now, we'll use a simple approach since we don't have session management
        // In a real app, you'd check cookies or tokens
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.success && userData.user) {
            setUser(userData.user);
          }
        }
      } catch (error) {
        // User not authenticated
        console.log('User not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      // Use Better Auth's logout endpoint
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Set logout flag in localStorage
        localStorage.setItem('swip_logged_out', 'true');
        // Clear user state
        setUser(null);
        // Redirect to home page
        window.location.href = '/';
      } else {
        console.error('Logout API failed');
        // Still logout locally even if API fails
        localStorage.setItem('swip_logged_out', 'true');
        setUser(null);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Still logout locally even on error
      localStorage.setItem('swip_logged_out', 'true');
      setUser(null);
      window.location.href = '/';
    }
  };

  const getDisplayName = (user: User) => {
    if (user.name) {
      // Return first name only
      return user.name.split(' ')[0];
    }
    // Fallback to email username
    return user.email.split('@')[0];
  };

  return (
    <header className="sticky top-0 z-40 border-b border-synheart-light-gray/50 bg-black/30 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-6">
        <Link href="/" className="relative font-bold text-2xl text-white">
          <span className="sr-only">SWIP</span>
          <span className="synheart-gradient-text text-shadow-glow">SWIP</span>
          <span className="ml-1 text-gray-300">Wellness Impact Protocol</span>
        </Link>
        <nav className="text-sm flex gap-2 md:gap-4 ml-auto items-center">
          <Link 
            href="/leaderboard" 
            className="px-3 py-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
          >
            Leaderboard
          </Link>
          <Link 
            href="/swipsessions" 
            className="px-3 py-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
          >
            Sessions
          </Link>
          <Link 
            href="/developer" 
            className="px-3 py-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
          >
            Developer
          </Link>
          
          {loading ? (
            <div className="ml-2 synheart-button-primary text-xs opacity-50">
              Loading...
            </div>
          ) : user ? (
            <div className="ml-2 flex items-center gap-3">
              <span className="text-sm text-gray-300">
                Hi {getDisplayName(user)}!
              </span>
              <Link 
                href="/profile" 
                className="synheart-button-secondary text-xs"
              >
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="synheart-button-primary text-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="ml-2 synheart-button-primary text-xs"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
