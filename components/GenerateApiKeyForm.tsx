"use client";

import { useState } from "react";

interface GenerateApiKeyFormProps {
  appId: string;
  onKeyGenerated: () => void;
}

export default function GenerateApiKeyForm({ appId, onKeyGenerated }: GenerateApiKeyFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      });

      if (response.ok) {
        onKeyGenerated();
      } else {
        console.error("Failed to generate API key");
      }
    } catch (error) {
      console.error("Error generating API key:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className="synheart-button-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Generating...
        </span>
      ) : (
        "Generate API Key"
      )}
    </button>
  );
}
