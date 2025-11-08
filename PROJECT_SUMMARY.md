# SWIP Dashboard - Project Summary

## 🎯 Project Overview

**SWIP Dashboard** is an open-source wellness transparency platform that visualizes anonymized wellness data from the **SWIP App** (mobile wellness tracker).

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**License**: MIT

---

## 🏗️ Architecture

### Dual Data Sources

1. **Developer Portal** (Existing)
   - Developers manually register apps
   - Generate API keys
   - Send data via `/api/swip/ingest`

2. **SWIP App** (New Integration)
   - User wellness tracker app
   - Automatically creates apps when users allow tracking
   - Sends detailed biosignal & emotion data
   - Public APIs (no auth required)

---

## 📊 Data Model

### Core Entities

```
User (Dashboard Users)
  ├── App (Wellness Applications)
  │   ├── AppSession (User sessions with apps)
  │   │   └── AppBiosignal (Physiological data)
  │   │       └── Emotion (AI-detected emotions)
  │   ├── ApiKey (Developer API keys)
  │   ├── SwipSession (Legacy sessions)
  │   └── LeaderboardSnapshot (Cached rankings)
```

### New Tables (SWIP App Integration)

- **AppSession** - User sessions (who used which app when)
- **AppBiosignal** - Wearable data (HR, HRV, SpO2, temp, etc.)
- **Emotion** - AI emotion detection with SWIP scores

---

## 🚀 API Endpoints

### SWIP App Integration (Public)

**Create/Update Data**:
- `POST /api/v1/apps` - Register/update tracked app
- `POST /api/v1/app_sessions` - Create session record
- `POST /api/v1/app_biosignals` - Bulk biosignal upload (array)
- `POST /api/v1/emotions` - Bulk emotion upload (array)

**Read Data**:
- `GET /api/v1/apps` - List all apps with stats
- `GET /api/v1/app_sessions` - List sessions (filterable)
- `GET /api/v1/app_biosignals` - Get biosignals for session
- `GET /api/v1/emotions` - Get emotions for biosignal/session

### Public Read APIs

- `GET /api/public/apps` - Apps list (legacy)
- `GET /api/public/apps/{id}` - App details
- `GET /api/public/stats` - Platform statistics

### Developer Portal (Protected)

- `POST /api/apps` - Create app (manual)
- `GET /api/apps` - List user apps
- `POST /api/api-keys` - Generate API key
- `PATCH /api/api-keys/{id}` - Revoke/reactivate key
- `DELETE /api/api-keys/{id}` - Delete key

---

## ✨ Key Features

### 1. Global Leaderboard
- App rankings by SWIP scores
- Top Applications, Developers, Categories
- 24-hour Redis cache
- Real-time updates from biosignal/emotion data

### 2. Session Explorer
- Browse all sessions
- Filter by date, emotion, app
- Detailed biosignal visualization
- Export functionality

### 3. Analytics Dashboard
- Total sessions, avg scores
- Stress rate calculations
- Trend visualizations
- Per-app breakdowns

### 4. Developer Portal
- App registration with auto-fill from stores
- API key management (generate, revoke, reactivate, delete)
- Per-app statistics
- Usage monitoring

### 5. Interactive API Docs
- Complete documentation at `/documentation`
- Try-it-out functionality
- Complete endpoint documentation
- Server selection (dev/prod)

### 6. Public Documentation
- Developer guide at `/documentation`
- SWIP App API guide
- Markdown with GFM tables
- Syntax-highlighted code blocks
- Copy buttons on code

---

## 🔐 Security

- **Authentication**: better-auth (Google, GitHub OAuth)
- **Protected Routes**: Middleware-based auth checks
- **Rate Limiting**: Redis-based (60-120 req/min)
- **API Keys**: Bcrypt hashed, SHA-256 lookup
- **Data Privacy**: All user IDs anonymized

---

## ⚡ Performance

### Caching Strategy
- **Leaderboard**: 24h Redis cache
- **App stats**: 5min cache
- **Platform stats**: 10min cache
- **Public APIs**: 1-10min CDN cache

### Database Optimization
- 50+ indexes on foreign keys, scores, timestamps
- Bulk insert support for biosignals/emotions
- Efficient time-series queries
- Automatic aggregation

### Frontend
- Next.js App Router with Server Components
- Client-side rendering for interactive components
- Image optimization
- Code splitting

---

## 🛠️ Tech Stack

**Frontend**:
- Next.js 16
- React 19
- Tailwind CSS
- Recharts (data visualization)
- Swagger UI React

**Backend**:
- Next.js API Routes
- Prisma ORM
- PostgreSQL 15+
- Redis (optional, for caching)

**Auth**:
- better-auth
- OAuth (Google, GitHub)

**Deployment**:
- Vercel (recommended)
- Docker (support available)

---

## 📁 Project Structure

```
swip-dashboard/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── v1/              # SWIP App integration (public)
│   │   ├── public/          # Public read APIs
│   │   ├── apps/            # App management (protected)
│   │   ├── api-keys/        # API key management
│   │   └── swip/            # Legacy session ingest
│   ├── leaderboard/         # Global leaderboard page
│   ├── sessions/            # Session explorer
│   ├── analytics/           # Analytics dashboard
│   ├── developer/           # Developer portal
│   ├── documentation/       # Public docs
│   └── auth/                # Authentication
├── components/              # React components
│   ├── charts/              # Chart components
│   └── ui/                  # UI primitives
├── content/                 # Markdown docs
│   ├── documentation.md     # Developer guide
│   ├── swip-app-api.md      # SWIP App API guide
│   ├── terms.md             # Terms of service
│   └── privacy.md           # Privacy policy
├── lib/                     # Shared utilities
│   ├── statistics.ts        # Platform stats
│   └── analytics.ts         # Analytics functions
├── prisma/                  # Database
│   ├── schema.prisma        # Data model
│   └── migrations/          # Migration history
├── public/                  # Static assets
│   └── logos/               # SWIP logos (SVG)
├── scripts/                 # Utility scripts
├── src/                     # Core libraries
│   ├── lib/                 # Server utilities
│   │   ├── db.ts           # Database client
│   │   ├── auth.ts         # Auth utilities
│   │   ├── redis.ts        # Redis client
│   │   ├── redis-leaderboard.ts  # Leaderboard caching
│   │   ├── swip.ts         # SWIP score calculation
│   │   ├── app-store.ts    # App store metadata fetching
│   │   └── logger.ts       # Winston logger
│   └── types/               # TypeScript types
├── middleware.ts            # Auth middleware
└── package.json             # Dependencies
```

---

## 🚦 Current Status

### ✅ Completed Features

- [x] Global leaderboard with 24h caching
- [x] Session explorer with filters
- [x] Analytics dashboard
- [x] Developer portal (apps & API keys)
- [x] Authentication (Google, GitHub OAuth)
- [x] SWIP App integration (4 public APIs)
- [x] Biosignal-level data tracking
- [x] AI emotion detection support
- [x] Automatic score aggregation
- [x] Redis caching layer
- [x] Interactive Swagger documentation
- [x] Markdown documentation with tables
- [x] Public read APIs
- [x] App store metadata fetching
- [x] Rate limiting
- [x] Logo deployment fix
- [x] Middleware auth protection

### 📋 Known Limitations

- OAuth requires Google/GitHub credentials
- Redis optional (fallback to DB)
- App store metadata scraping may fail if stores change
- Leaderboard updates every 24h (not real-time)

---

## 📈 Metrics

- **120** TypeScript files
- **30** API endpoints
- **10** database tables
- **50+** database indexes
- **5** migrations applied
- **4** SWIP App integration endpoints
- **3** public read endpoints

---

## 🎨 UI/UX Highlights

- Dark theme with purple/pink gradients
- Responsive design (mobile-first)
- Glassmorphism effects
- Smooth animations
- Professional typography
- Accessible components
- Toast notifications
- Loading states
- Error handling

---

## 🔄 Data Flow

### SWIP App → Dashboard

```
1. User allows app tracking in SWIP App
   ↓
2. SWIP App → POST /api/v1/apps
   ↓
3. App created in Dashboard (no owner)
   ↓
4. User interacts with app
   ↓
5. SWIP App → POST /api/v1/app_sessions
   ↓
6. Session created
   ↓
7. Wearable collects data
   ↓
8. SWIP App → POST /api/v1/app_biosignals (bulk)
   ↓
9. Biosignals stored
   ↓
10. AI detects emotions
    ↓
11. SWIP App → POST /api/v1/emotions (bulk)
    ↓
12. Emotions stored
    ↓
13. System auto-calculates:
    - Session avg = AVG(emotion.swipScore)
    - App avg = AVG(session.avgSwipScore)
    ↓
14. Leaderboard updated (next 24h refresh)
    ↓
15. Public can view on Dashboard
```

---

## 🧪 Testing

### Quick Test

```bash
# Start dev server
npm run dev

# Test SWIP App workflow
bash scripts/test-swip-app-integration.sh

# View results
open http://localhost:3000/leaderboard
```

### Complete E2E Test

See `TESTING.md` for comprehensive testing guide.

---

## 🚀 Deployment Checklist

- [ ] Environment variables set in hosting platform
- [ ] Database URL configured
- [ ] Redis URL configured (optional)
- [ ] OAuth credentials configured
- [ ] `BETTER_AUTH_SECRET` set (min 32 chars)
- [ ] `BETTER_AUTH_URL` set to production URL
- [ ] Run `npx prisma migrate deploy`
- [ ] Run `npm run build`
- [ ] Deploy to Vercel/hosting platform
- [ ] Verify logos load
- [ ] Test authentication flow
- [ ] Test SWIP App APIs
- [ ] Verify leaderboard displays

---

## 📞 Support & Resources

- **Live Demo**: [your-domain.com](https://your-domain.com)
- **Documentation**: [your-domain.com/documentation](https://your-domain.com/documentation)
- **Developer Guide**: [/documentation](/documentation)
- **GitHub**: [github.com/your-org/swip-dashboard](https://github.com/your-org/swip-dashboard)
- **Email**: support@swip.synheart.ai

---

## 🎉 What's New (Latest)

### November 4, 2025

**SWIP App Integration**:
- ✅ Added 4 new public APIs for SWIP App
- ✅ Biosignal-level data tracking (HR, HRV, SpO2, etc.)
- ✅ AI emotion detection support
- ✅ Automatic SWIP score aggregation
- ✅ Enhanced leaderboard with new data sources

**Improvements**:
- ✅ Fixed Vercel logo deployment
- ✅ Fixed markdown table rendering (remark-gfm)
- ✅ Updated emotion list to valid values only
- ✅ Removed trend % from leaderboard cards
- ✅ Added rank columns to all leaderboard tables
- ✅ Real data on landing page
- ✅ Calculated percentages in platform analytics

**Developer Experience**:
- ✅ Interactive Swagger documentation
- ✅ App store metadata auto-fill
- ✅ Enhanced app registration form
- ✅ Comprehensive API documentation

---

## 🏆 Achievements

- **Production-Ready**: Full build succeeds
- **Type-Safe**: 100% TypeScript
- **Well-Documented**: 3 comprehensive docs
- **Tested**: E2E workflow verified
- **Performant**: Redis caching + indexed queries
- **Secure**: OAuth + rate limiting + middleware
- **Open**: Public APIs + transparency focus

---

**Built with ❤️ for wellness transparency**

*Last updated: November 4, 2025*

