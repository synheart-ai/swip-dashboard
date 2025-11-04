# SWIP Dashboard

**Smart Wellness Intelligence Protocol Dashboard** - An open-source transparency platform for wellness application impact metrics.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)

---

## 📖 Overview

The SWIP Dashboard is a public transparency platform that visualizes wellness impact data from apps tracked by the **SWIP App** (a user wellness tracker). It provides:

- 📊 **Global Leaderboard** - Rankings of wellness apps by SWIP scores
- 🔬 **Session Explorer** - Detailed biosignal and emotion data
- 📈 **Analytics Dashboard** - Wellness trends and statistics
- 🔓 **Public APIs** - Open access to anonymized wellness data
- 👨‍💻 **Developer Portal** - App registration and API key management

---

## 🏗️ Architecture

### Data Sources

**Dual App Creation**:
1. **Developer Portal** - Developers manually register their apps
2. **SWIP App** - User wellness tracker automatically creates apps when users allow tracking

**SWIP App** sends:
- **Apps** - Which apps users are tracking
- **Sessions** - User interaction sessions
- **Biosignals** - Physiological data (HR, HRV, SpO2, etc.)
- **Emotions** - AI-detected emotional states

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 15+
- **Redis** (optional, for caching)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/swip-dashboard.git
cd swip-dashboard

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your database and auth credentials

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

Create `.env.local` with the following:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/swip_dashboard"

# Authentication (better-auth)
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Redis (optional, for caching)
REDIS_URL="redis://localhost:6379"

# Logging
ENABLE_FILE_LOGGING="false"  # Set to "true" for local development only
```

See `env.example` for complete reference.

---

## 📊 Database Schema

### Core Tables

- **User** - Dashboard users (view-only or developers)
- **App** - Wellness applications (from portal or SWIP App)
- **AppSession** - User sessions with tracked apps
- **AppBiosignal** - Physiological data from wearables
- **Emotion** - AI-detected emotions with SWIP scores
- **ApiKey** - API keys for developer integration
- **LeaderboardSnapshot** - Cached leaderboard rankings

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# View database
npx prisma studio
```

---

## 🌐 API Endpoints

### SWIP App Integration (Public)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/apps` | POST | Register or update tracked app |
| `/api/v1/app_sessions` | POST | Create user session record |
| `/api/v1/app_biosignals` | POST | Bulk upload biosignal data |
| `/api/v1/emotions` | POST | Bulk upload emotion data |

### Public Read APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/apps` | GET | List all apps with statistics |
| `/api/v1/app_sessions` | GET | List sessions (filterable) |
| `/api/v1/app_biosignals` | GET | Get biosignals for session |
| `/api/v1/emotions` | GET | Get emotions for biosignal/session |
| `/api/public/stats` | GET | Platform-wide statistics |

### Developer Portal (Protected)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/apps` | GET/POST | Manage user apps |
| `/api/api-keys` | GET/POST | Manage API keys |
| `/api/analytics/*` | GET | Analytics data |

### Documentation

- **Complete Documentation**: `/documentation`
- **Developer Guide**: `/documentation`
- **SWIP App API Guide**: `/documentation` (see swip-app-api.md)

---

## 📱 SWIP App Integration

Complete workflow from SWIP App:

```bash
# Step 1: Register app
curl -X POST http://localhost:3000/api/v1/apps \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "com.example.wellness",
    "app_name": "Wellness Tracker",
    "category": "Health",
    "developer": "Example Inc"
  }'

# Step 2: Create session
curl -X POST http://localhost:3000/api/v1/app_sessions \
  -H "Content-Type: application/json" \
  -d '{
    "app_session_id": "uuid-here",
    "user_id": "user_123",
    "device_id": "device_456",
    "started_at": "2025-11-04T12:00:00Z",
    "app_id": "com.example.wellness"
  }'

# Step 3: Upload biosignals (bulk)
curl -X POST http://localhost:3000/api/v1/app_biosignals \
  -H "Content-Type: application/json" \
  -d '[{
    "app_biosignal_id": "uuid-1",
    "app_session_id": "uuid-here",
    "timestamp": "2025-11-04T12:00:05Z",
    "heart_rate": 72,
    "hrv_sdnn": 65.4
  }]'

# Step 4: Upload emotions (bulk)
curl -X POST http://localhost:3000/api/v1/emotions \
  -H "Content-Type: application/json" \
  -d '[{
    "app_biosignal_id": "uuid-1",
    "swip_score": 78.5,
    "confidence": 0.85,
    "dominant_emotion": "calm",
    "model_id": "wesad_emotion_v1_0"
  }]'
```

The system automatically:
- ✅ Calculates session average from emotions
- ✅ Updates app average from sessions
- ✅ Refreshes leaderboard rankings

---

## 🎨 Frontend Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/leaderboard` | Protected | Global app rankings |
| `/sessions` | Protected | Session explorer with filters |
| `/analytics` | Protected | Analytics dashboard |
| `/developer` | Protected | Developer portal (apps & API keys) |
| `/profile` | Protected | User profile |
| `/documentation` | Public | Developer guide |
| `/terms` | Public | Terms of service |
| `/privacy` | Public | Privacy policy |

---

## 🔒 Authentication

Using **better-auth** with support for:
- Google OAuth
- GitHub OAuth
- Email/Password (optional)

Protected routes require authentication. Middleware handles redirection.

---

## ⚡ Performance Optimizations

### Redis Caching
- Leaderboard: 24-hour cache
- App stats: 5-minute cache
- Platform stats: 10-minute cache

### Database Indexes
- All foreign keys indexed
- Score fields indexed for sorting
- Timestamp fields for time-series queries
- Composite indexes for common filters

### Bulk Operations
- Biosignals accepted as arrays (up to 100/request)
- Emotions accepted as arrays (up to 100/request)
- Efficient batch inserts

---

## 🧪 Testing

### Run Tests

```bash
# Build project
npm run build

# Run Prisma Studio (database GUI)
npx prisma studio

# Test APIs with Postman
# Import: postman_swip.json
```

### End-to-End Testing

See `TESTING.md` for complete E2E testing guide.

---

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Deploy production
vercel --prod
```

### Docker

```dockerfile
# Dockerfile included (coming soon)
docker build -t swip-dashboard .
docker run -p 3000:3000 swip-dashboard
```

### Environment Variables

Ensure all environment variables are set in your deployment platform:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `REDIS_URL` (optional)
- OAuth credentials (if using)

---

## 📁 Project Structure

```
swip-dashboard/
├── app/                      # Next.js app router
│   ├── api/                  # API routes
│   │   ├── v1/              # SWIP App integration APIs
│   │   ├── public/          # Public read APIs
│   │   ├── apps/            # App management
│   │   ├── api-keys/        # API key management
│   │   └── swip/            # Legacy session ingest
│   ├── leaderboard/         # Leaderboard page
│   ├── sessions/            # Sessions explorer
│   ├── analytics/           # Analytics dashboard
│   ├── developer/           # Developer portal
│   └── auth/                # Authentication
├── components/              # React components
├── content/                 # Markdown documentation
├── lib/                     # Utility functions
├── prisma/                  # Database schema & migrations
├── public/                  # Static assets (logos)
├── src/                     # Core libraries
│   ├── lib/                 # Server utilities
│   └── types/               # TypeScript types
└── scripts/                 # Utility scripts
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Prisma** - Database ORM
- **better-auth** - Authentication
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Redis** - Caching layer

---

## 📞 Support

- **Documentation**: [/documentation](/documentation)
- **API Documentation**: [/documentation](/documentation)
- **Email**: support@swip-dashboard.com
- **GitHub Issues**: [github.com/your-org/swip-dashboard/issues](https://github.com/your-org/swip-dashboard/issues)

---

## 🗺️ Roadmap

- [x] Global leaderboard with rankings
- [x] Session explorer with biosignal data
- [x] Developer portal for app management
- [x] SWIP App integration APIs
- [x] AI emotion detection support
- [x] Redis caching layer
- [x] Interactive API documentation
- [ ] GraphQL API
- [ ] Real-time websocket updates
- [ ] Mobile app (React Native)
- [ ] Advanced analytics & ML insights

---

**Built with ❤️ for wellness transparency**

*Last updated: November 4, 2025*
