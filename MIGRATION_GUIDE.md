# Migration Guide - Phase 1 (P1) Features

## Overview
This guide explains how to migrate your database to support the new Phase 1 features added to the SWIP Dashboard.

## New Features Added
- Comprehensive analytics dashboard with filters
- Session explorer with detailed metrics
- Enhanced leaderboard with category and developer information
- KPI cards for all P1 metrics
- Trend charts for users, sessions, SWIP scores, and stress rates
- Heatmap visualization for SWIP scores by day/hour
- Bio signals charts

## Database Changes

### New Fields in `App` table:
- `category` (String, optional) - App category (Health, Communication, Game, Entertainment)

### New Fields in `SwipSession` table:
- `stressRate` (Float, optional) - Stress rate (0-100)
- `wearable` (String, optional) - Wearable device name
- `os` (String, optional) - Operating system (iOS, Android)
- `duration` (Integer, optional) - Session duration in seconds
- `endedAt` (DateTime, optional) - Session end timestamp

## Migration Steps

### Option 1: Using Prisma Migrate (Recommended)

```bash
# Make sure you have DATABASE_URL set in .env.local
# Then run:
npx prisma migrate deploy
```

### Option 2: Manual SQL Migration

If you prefer to run the migration manually, execute the following SQL:

```sql
-- Add new column to App table
ALTER TABLE "App" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- Add new columns to SwipSession table
ALTER TABLE "SwipSession" 
  ADD COLUMN IF NOT EXISTS "stressRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "wearable" TEXT,
  ADD COLUMN IF NOT EXISTS "os" TEXT,
  ADD COLUMN IF NOT EXISTS "duration" INTEGER,
  ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "App_category_idx" ON "App"("category");
CREATE INDEX IF NOT EXISTS "SwipSession_wearable_idx" ON "SwipSession"("wearable");
CREATE INDEX IF NOT EXISTS "SwipSession_os_idx" ON "SwipSession"("os");
CREATE INDEX IF NOT EXISTS "SwipSession_stressRate_idx" ON "SwipSession"("stressRate");
```

### Option 3: Reset Database (Development Only)

⚠️ **WARNING**: This will delete all existing data!

```bash
npx prisma migrate reset
```

## Testing the Migration

After running the migration:

1. Generate Prisma Client:
```bash
npx prisma generate
```

2. Build the project:
```bash
npm run build
```

3. Start the development server:
```bash
npm run dev
```

4. Visit the following pages to verify:
   - `/analytics` - Analytics dashboard
   - `/sessions` - Sessions explorer
   - `/leaderboard` - Updated leaderboard

## API Integration

To submit session data with the new fields, use the following format:

```json
{
  "app_id": "your_app_id",
  "session_id": "unique_session_id",
  "metrics": {
    "hr": [72, 75, 73, 70, 68],
    "rr": [850, 820, 840, 870, 880],
    "hrv": {
      "sdnn": 52.3,
      "rmssd": 48.1
    },
    "emotion": "calm",
    "stressRate": 35.5,
    "wearable": "Apple Watch",
    "os": "iOS",
    "duration": 300,
    "timestamp": "2025-10-31T12:00:00Z"
  }
}
```

## Troubleshooting

### Error: Column does not exist

If you see errors about missing columns:
1. Verify the migration was applied: `npx prisma migrate status`
2. Run the migration: `npx prisma migrate deploy`
3. Regenerate Prisma Client: `npx prisma generate`

### Error: Cannot connect to database

Make sure your `DATABASE_URL` is set in `.env.local`:
```
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Rollback (if needed)

To rollback the migration:

```sql
-- Remove indexes
DROP INDEX IF EXISTS "App_category_idx";
DROP INDEX IF EXISTS "SwipSession_wearable_idx";
DROP INDEX IF EXISTS "SwipSession_os_idx";
DROP INDEX IF EXISTS "SwipSession_stressRate_idx";

-- Remove columns
ALTER TABLE "App" DROP COLUMN IF EXISTS "category";
ALTER TABLE "SwipSession" 
  DROP COLUMN IF EXISTS "stressRate",
  DROP COLUMN IF EXISTS "wearable",
  DROP COLUMN IF EXISTS "os",
  DROP COLUMN IF EXISTS "duration",
  DROP COLUMN IF EXISTS "endedAt";
```

## Support

For issues or questions, please refer to:
- [Prisma Documentation](https://www.prisma.io/docs)
- [SWIP Protocol Documentation](https://github.com/synheart-ai/swip)

