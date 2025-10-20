"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Form states - only name editing
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.success && userData.user) {
            setUser(userData.user);
            setName(userData.user.name || "");
          } else {
            // Redirect to auth if not logged in
            window.location.href = '/auth';
          }
        } else {
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        window.location.href = '/auth';
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("Username updated successfully!");
        setUser(data.user);
      } else {
        setMessage(data.error || "Failed to update username");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("Network error - please check your connection");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="synheart-card p-6 text-center">
          <div className="text-synheart-pink">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="synheart-card p-6 text-center">
          <div className="text-red-400 mb-4">Not authenticated</div>
          <Link href="/auth" className="synheart-button-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold synheart-gradient-text">Profile Settings</h1>
      
      {/* Edit Username */}
      <div className="synheart-card p-6">
        <h2 className="text-lg font-medium text-white mb-4">Edit Username</h2>
        <p className="text-sm text-gray-400 mb-4">
          Change your display name (first name) that appears in the header and throughout the app.
        </p>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm text-synheart-pink mb-2">Username (First Name)</label>
            <input 
              className="synheart-input w-full" 
              type="text"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your first name" 
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be displayed as "Hi {name || 'Username'}!" in the header
            </p>
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting || !name.trim()} 
            className="synheart-button-primary disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Username"}
          </button>
        </form>
      </div>

      {/* Account Information */}
      <div className="synheart-card p-6">
        <h2 className="text-lg font-medium text-white mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">User ID:</span>
            <span className="text-gray-300 font-mono">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Email:</span>
            <span className="text-gray-300">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Username:</span>
            <span className="text-gray-300">{user.name || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Auth Provider:</span>
            <span className="text-gray-300">OAuth (GitHub/Google)</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Note:</strong> Your email and authentication are managed by your OAuth provider (GitHub or Google). 
            You can only change your display username here.
          </p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.includes("successfully") 
            ? "text-green-400 bg-green-900/20" 
            : "text-red-400 bg-red-900/20"
        }`}>
          {message}
        </div>
      )}

      {/* Navigation */}
      <div className="text-sm text-gray-400 text-center">
        <Link className="text-synheart-pink hover:underline" href="/developer">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
