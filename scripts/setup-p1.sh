#!/bin/bash

# SWIP Dashboard - Phase 1 Setup Script
# This script sets up the P1 features including database migrations

set -e

echo "🚀 SWIP Dashboard - Phase 1 Setup"
echo "=================================="
echo ""
# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    set -a
    . ./.env.local
    set +a
    echo "✅ Environment variables loaded from .env.local"
else
    echo "ℹ️  No .env.local file found, continuing with existing env"
fi


# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Warning: DATABASE_URL is not set in environment"
    echo "   Please create a .env.local file with your database connection:"
    echo "   DATABASE_URL=\"postgresql://user:password@host:port/database\""
    echo ""
    read -p "Do you want to continue without running migrations? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    SKIP_MIGRATION=true
else
    echo "✅ Database URL found"
    SKIP_MIGRATION=false
fi

echo ""
echo "📦 Installing dependencies..."
bun install

echo ""
echo "🔄 Generating Prisma Client..."
npx prisma generate

if [ "$SKIP_MIGRATION" = false ]; then
    echo ""
    echo "🗄️  Running database migrations..."
    npx prisma migrate deploy
    
    echo ""
    echo "✅ Database migrated successfully!"
else
    echo ""
    echo "⏭️  Skipping database migration"
    echo "   Remember to run 'npx prisma migrate deploy' when your database is ready"
fi

echo ""
echo "🔨 Building project..."
bun run build

echo ""
echo "=================================="
echo "✅ Phase 1 Setup Complete!"
echo "=================================="
echo ""
echo "📝 Next steps:"
echo "   1. Make sure your database is migrated (if not done above)"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. Visit http://localhost:3000/analytics for the new dashboard"
echo ""
echo "📚 Documentation:"
echo "   - P1_FEATURES.md - Complete feature list"
echo "   - MIGRATION_GUIDE.md - Database migration instructions"
echo ""
echo "🎉 Happy coding!"

