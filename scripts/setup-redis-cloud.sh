#!/bin/bash

# Redis Cloud Setup Script for SWIP Dashboard
# This script helps you configure Redis Cloud for the SWIP Dashboard

echo "🚀 Redis Cloud Setup for SWIP Dashboard"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
else
    echo "📝 .env.local already exists"
fi

echo ""
echo "🔧 Redis Cloud Configuration Steps:"
echo ""
echo "1. Go to https://redis.com/try-free/"
echo "2. Create a free Redis Cloud account"
echo "3. Create a new database"
echo "4. Copy the connection details"
echo ""
echo "📋 You'll need these details:"
echo "   - Host/Endpoint"
echo "   - Port"
echo "   - Password"
echo ""
echo "🔑 Add your Redis Cloud connection to .env.local:"
echo ""
echo "Option A (Recommended):"
echo "REDIS_URL=\"redis://:your-password@your-host:port\""
echo ""
echo "Option B:"
echo "REDIS_HOST=\"your-host\""
echo "REDIS_PORT=\"your-port\""
echo "REDIS_PASSWORD=\"your-password\""
echo ""
echo "🧪 Test your Redis Cloud connection:"
echo "npm run test:redis"
echo ""
echo "🏥 Check application health:"
echo "curl http://localhost:3000/api/health"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "REDIS_CLOUD_SETUP.md"
echo ""
echo "✨ Happy coding with Redis Cloud!"
