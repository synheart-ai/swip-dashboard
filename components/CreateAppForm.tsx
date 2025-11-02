"use client";

import { useState } from "react";

interface CreateAppFormProps {
  onAppCreated: () => void;
}

export default function CreateAppForm({ onAppCreated }: CreateAppFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setName("");
        onAppCreated();
      } else {
        setError(data.error || "Failed to create app");
      }
    } catch (error) {
      console.error("Error creating app:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="app-name" className="block text-sm font-medium mb-2">
          App Name
        </label>
        <input
          id="app-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Awesome App"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          required
        />
        <p className="text-xs text-gray-500 mt-2">
          Give your app a descriptive name that helps you identify it.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating App...
          </span>
        ) : (
          "Create App"
        )}
      </button>
    </form>
  );
}
