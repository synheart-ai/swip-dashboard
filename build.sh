#!/bin/sh

# Run Prisma migrations
bun run prisma:generate && bun run logs:dir
npx prisma migrate deploy

# Build your Next.js app
npm run build
