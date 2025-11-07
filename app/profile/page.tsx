"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../src/lib/auth-client";
import { ModernProfile } from "../../components/ModernProfile";

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await authClient.getSession();
        if (data?.user?.id) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.name || undefined,
          });
        } else {
          // Redirect to auth if no session
          router.push("/auth");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <ModernProfile
          user={user}
          onUpdateName={async (name) => {
            setUpdating(true);
            try {
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
          }}
          onSignOut={handleSignOut}
          updating={updating}
        />
      </div>
    </div>
  );
}
