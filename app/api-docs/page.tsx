/**
 * API Documentation Page
 * 
 * Swagger UI for API documentation
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    // Fetch the Swagger spec
    fetch('/api/swagger')
      .then(res => res.json())
      .then(data => setSpec(data))
      .catch(err => console.error('Failed to load API spec:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  SWIP
                </span>
                <span className="text-white"> API Documentation</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Complete REST API reference for developers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/documentation"
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
              >
                Guide
              </a>
              <a
                href="/developer"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all text-sm font-semibold"
              >
                Developer Portal
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {spec ? (
          <div className="swagger-container bg-gray-900/30 rounded-xl border border-gray-800 p-6">
            <SwaggerUI spec={spec} />
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-400">Loading API documentation...</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom styles for Swagger UI */}
      <style jsx global>{`
        .swagger-container .swagger-ui {
          font-family: inherit;
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info .title {
          color: #fff;
        }
        .swagger-ui .info p {
          color: #9ca3af;
        }
        .swagger-ui .scheme-container {
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid #374151;
        }
        .swagger-ui .opblock {
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid #374151;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .swagger-ui .opblock-tag {
          color: #fff;
        }
        .swagger-ui .opblock .opblock-summary-method {
          background: linear-gradient(to right, rgb(147 51 234), rgb(219 39 119));
        }
        .swagger-ui .btn.execute {
          background: linear-gradient(to right, rgb(147 51 234), rgb(219 39 119));
          border: none;
        }
        .swagger-ui .btn.execute:hover {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
}

