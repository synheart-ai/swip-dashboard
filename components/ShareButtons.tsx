/**
 * Social Media Share Buttons & Export Options
 *
 * Share leaderboard rankings on social media and export data
 */

"use client";

import { useEffect, useState } from "react";
import html2canvas from "html2canvas";

interface ShareButtonsProps {
  type: "app" | "leaderboard";
  appName?: string;
  rank?: number;
  score?: number;
  leaderboardData?: any; // Full leaderboard data for export
}

export function ShareButtons({
  type,
  appName,
  rank,
  score,
  leaderboardData,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const getShareText = () => {
    if (type === "app" && appName && rank && score) {
      return `🏆 ${appName} ranked #${rank} on the SWIP Global Leaderboard with a wellness score of ${score.toFixed(
        1
      )}! Check it out: ${window.location.origin}/leaderboard`;
    }
    return `🌟 Check out the SWIP Global Leaderboard - Real-time wellness app rankings! ${window.location.origin}/leaderboard`;
  };

  const shareToTwitter = () => {
    const text = getShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      window.location.origin + "/leaderboard"
    )}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  const copyLink = () => {
    const text = getShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export as CSV
  const exportAsCSV = () => {
    if (!leaderboardData) return;

    const headers = [
      "Rank",
      "App Name",
      "Category",
      "SWIP Score",
      "Stress Rate",
      "Sessions",
    ];
    const rows = leaderboardData.entries.map((entry: any) => [
      entry.rank,
      entry.appName,
      entry.category,
      entry.appSwipScore?.toFixed(1) || "0",
      entry.avgStressRate?.toFixed(1) || "0",
      entry.sessions || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `swip-leaderboard-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export as JSON
  const exportAsJSON = () => {
    if (!leaderboardData) return;

    const jsonData = {
      exportedAt: new Date().toISOString(),
      stats: leaderboardData.stats,
      entries: leaderboardData.entries,
      developerData: leaderboardData.developerData,
      categoryData: leaderboardData.categoryData,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `swip-leaderboard-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Capture screenshot
  const captureScreenshot = async () => {
    setIsCapturing(true);
    try {
      // Find the leaderboard container
      const element = document.querySelector(
        "[data-screenshot-container]"
      ) as HTMLElement;
      if (!element) {
        alert("Unable to capture screenshot. Please try again.");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#0f0f0f",
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `swip-leaderboard-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setShowExportMenu(false);
    } catch (error) {
      console.error("Screenshot failed:", error);
      alert("Failed to capture screenshot. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  // If clicked outside of the export menu, close it
  const handleClickOutside = (event: MouseEvent) => {
    if (showExportMenu && event.target instanceof Element && !event.target.closest(".export-menu")) {
      setShowExportMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showExportMenu]);

  return (
    <div className="flex items-center gap-2">
      {/* Twitter */}
      <button
        onClick={shareToTwitter}
        className="p-2 rounded-lg bg-gray-900/50 border border-gray-800 text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-all"
        title="Share on Twitter"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
        </svg>
      </button>

      {/* LinkedIn */}
      <button
        onClick={shareToLinkedIn}
        className="p-2 rounded-lg bg-gray-900/50 border border-gray-800 text-gray-400 hover:text-blue-600 hover:border-blue-600/50 transition-all"
        title="Share on LinkedIn"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-gray-400 hover:text-purple-400 hover:border-purple-500/50 transition-all text-sm"
        title="Copy link"
      >
        {copied ? (
          <>
            <svg
              className="w-4 h-4 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-400">Copied!</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Export Options (only for leaderboard type) */}
      {type === "leaderboard" && leaderboardData && (
        <div className="relative export-menu">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all text-sm font-medium"
            title="Export data"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Export</span>
          </button>

          {/* Export Dropdown Menu */}
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl z-50 overflow-hidden">
              <button
                onClick={exportAsCSV}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-3"
              >
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export as CSV
              </button>
              <button
                onClick={exportAsJSON}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-3"
              >
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                Export as JSON
              </button>
              <button
                onClick={captureScreenshot}
                disabled={isCapturing}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {isCapturing ? "Capturing..." : "Screenshot"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
