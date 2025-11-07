/**
 * Global Error Page
 *
 * Catches errors in the app router
 */

'use client';

import { useEffect } from 'react';
import { logError } from '../src/lib/logger-client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-400 mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg text-left">
            <p className="text-sm text-red-400 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-gradient-to-r from-[#7a40fd] to-synheart-blue text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
