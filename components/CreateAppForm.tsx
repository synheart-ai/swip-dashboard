"use client";

import { useState } from "react";

interface CreateAppFormProps {
  onAppCreated: () => void;
}

export default function CreateAppForm({ onAppCreated }: CreateAppFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        setName("");
        onAppCreated();
      } else {
        console.error("Failed to create app");
      }
    } catch (error) {
      console.error("Error creating app:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="app-name" className="block text-sm font-medium text-synheart-pink mb-3">
          App Name
        </label>
        <input
          id="app-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your app name"
          className="synheart-input w-full"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className="synheart-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating...
          </span>
        ) : (
          "Create App"
        )}
      </button>
    </form>
  );
}
