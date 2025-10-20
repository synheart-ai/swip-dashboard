/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are available by default in Next.js 15
  serverExternalPackages: ['@prisma/client'],
  
  // Output configuration for Amplify
  output: 'standalone',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
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
}

export default nextConfig