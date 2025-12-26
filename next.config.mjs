import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are available by default in Next.js 15
  serverExternalPackages: ["@prisma/client"],

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      // Ensure SVG files are served with correct content type
      {
        source: "/logos/:path*.svg",
        headers: [
          {
            key: "Content-Type",
            value: "image/svg+xml",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: [],
  },

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // React 19 and Next.js 15 compatibility
  reactStrictMode: true,

  // Suppress hydration warnings for browser extensions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Environment variables for Amplify
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

export default withMDX(nextConfig);
