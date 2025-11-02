#!/bin/sh

# Run Prisma migrations
npx prisma migrate deploy

# Build your Next.js app
npm run build
