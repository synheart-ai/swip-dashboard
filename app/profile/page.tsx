"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "../../src/lib/auth-client";

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.user?.id) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.name || undefined,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpdateName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="synheart-card p-6 text-center">
          <div className="text-synheart-pink">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="synheart-card p-6 text-center">
          <div className="text-red-400 mb-4">Not authenticated</div>
          <Link href="/auth" className="synheart-button-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold synheart-gradient-text">
        Profile
      </h1>
      
      <div className="synheart-card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-white mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <div className="text-white bg-gray-800 px-3 py-2 rounded border border-gray-600">
                {user.email}
              </div>
            </div>
            
            <form onSubmit={handleUpdateName} className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-sm text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={user.name || ""}
                  placeholder="Enter your display name"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-synheart-pink"
                />
              </div>
              <button
                type="submit"
                disabled={updating}
                className="synheart-button-primary w-full disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Name"}
              </button>
            </form>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-600">
          <button
            onClick={handleSignOut}
            className="synheart-button-secondary w-full"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-400 text-center">
        <Link className="text-synheart-pink hover:underline" href="/developer">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
