'use client';

import { useState } from 'react';

export function DocsSearch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-700 transition-all group"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left text-sm">Search documentation...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 rounded border border-gray-700 text-gray-500">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Search Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-xl mx-4 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-500 hover:text-white px-2 py-1 bg-gray-800 rounded"
              >
                ESC
              </button>
            </div>
            <div className="p-4 text-center text-gray-500 text-sm">
              <p>Start typing to search...</p>
              <p className="mt-2 text-xs">
                Try: "API", "authentication", "sessions"
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

