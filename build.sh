#!/bin/sh

set -e

echo "🔄 Installing dependencies with Bun..."
bun install

echo "🔄 Generating Prisma client..."
bunx prisma generate

echo "🔄 Running Prisma migrations (production)..."
bunx prisma migrate deploy

echo "🔄 Building Next.js app with Bun..."
bunx next build

echo "✅ Build complete!"

# Optional: Remove dev dependencies and caches for smaller deployments
# bun prune --production
# rm -rf node_modules/.cache 1
