# SWIP Dashboard

An open-source transparency platform that surfaces wellness impact metrics for applications built on the Synheart Wellness Impact Protocol (SWIP).

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)

---

## Why SWIP Dashboard?

The dashboard converts raw biosignal data into actionable wellness insights. Developers can:

- Track wellness outcomes for their apps once they are verified.
- Claim existing SWIP-tracked apps to access read-only analytics.
- Monitor anonymized population metrics through public APIs.
- Export leaderboard data for reports and social sharing.

This repository contains the production dashboard deployed at **https://dashboard.swip.app**.

---

## Feature Highlights

- **Global Leaderboard** – Ranks every tracked application by rolling SWIP score.
- **Session Explorer** – Visualizes biosignals and model-derived emotions per session.
- **Developer Portal** – Manage apps, claim records, and generate API keys.
- **REST APIs** – Separate ingestion (write) and analytics (read) surfaces with API-key security.
- **Exports & Sharing** – CSV/JSON export plus screenshot sharing for verified leaders.

---

## Architecture Overview

```
Wearables ─┐
           ├─> Synheart Wear adapters → SWIP SDK → Verified ingestion API → PostgreSQL
Mobile App ┘

PostgreSQL + Redis → SWIP Dashboard API → Next.js App Router → Dashboard UI
                                         ↳ Public /api/v1/* analytics
                                         ↳ Developer portal (apps, keys, claims)
```

- **Wearable capture** is handled by the Synheart Wear device adapters ([synheart-ai/synheart-wear](https://github.com/synheart-ai/synheart-wear)).  
- **Application ingestion** uses the SWIP SDK ([synheart-ai/swip](https://github.com/synheart-ai/swip)) to package biosignals, sessions, and SWIP scores.  
- **Dashboard ingestion** only accepts data from verified API keys bound to an external app ID.  
- **Read APIs** surface anonymized metrics and are available to any developer with a dashboard API key.

---

## Developer Workflow

1. **Create a dashboard account** (Google/GitHub OAuth).
2. **Register or claim** your application in the Developer Portal.  
   - Apps created automatically by other SWIP sources can be claimed via package/bundle ID verification.
3. **Generate an API key** for analytics access.  
   - Keys are scoped to the apps you own.  
   - Use them via the `x-api-key` header on all `/api/v1/*` requests.
4. **Request ingestion verification** _(optional)_ if you need to send biosignals:  
   - Provide regulatory and privacy details to the Synheart review team.  
   - Upon approval, you receive an ingestion-scoped key that can be used with the SWIP SDK.  
   - Ingestion requests without verification are rejected.
5. **Integrate the SWIP SDK** for ingestion (if approved). Use Synheart Wear adapters to communicate with popular wearables.

> **Note:** The first-party SWIP mobile app already has ingestion access – independent developers must follow the verification flow above.

---

## Local Development

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 15+
- **Redis** (optional, for caching)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/synheart-ai/swip-dashboard.git
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

Check `env.example` for the full list, including optional telemetry toggles.

---

## API Surfaces

Base URL: `https://dashboard.swip.app/api`

### 1. Analytics (Read-Only)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/apps` | GET | List claimed apps with summaries. Supports `limit`, `category`. |
| `/v1/app_sessions` | GET | Paginated SWIP sessions. Filter by `app_id`. |
| `/v1/app_biosignals` | GET | Biosignals for a session (`app_session_id` required). |
| `/v1/emotions` | GET | Emotion records for a session/biosignal. |
| `/public/stats` | GET | Aggregated anonymized metrics for the entire platform. |

All analytics requests must include:

```http
x-api-key: YOUR_ANALYTICS_KEY
```

### 2. Ingestion (Write)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/apps` | POST | Upsert app metadata. |
| `/v1/app_sessions` | POST | Create/update sessions. |
| `/v1/app_biosignals` | POST | Bulk biosignal ingest (array). |
| `/v1/emotions` | POST | Bulk emotion ingest (array). |

Ingestion keys are only issued to verified partners. Each ingestion key is locked to an external app ID; attempting to ingest data for other IDs results in `403 Forbidden`.

### Supported Emotions (production model)

| Dominant Emotion | Description |
|------------------|-------------|
| `calm` | Relaxed, low stress |
| `stressed` | Elevated stress markers |
| `focused` | Sustained attentive state |

Historical datasets may contain deprecated labels (happy, neutral, etc.), but the realtime classifier emits only the three values above.

---

## Example Usage

Fetch the top 10 apps you own:

```bash
curl -X GET "https://dashboard.swip.app/api/v1/apps?limit=10" \
  -H "x-api-key: YOUR_ANALYTICS_KEY"
```

Query biosignals for a session:

```bash
curl -X GET "https://dashboard.swip.app/api/v1/app_biosignals?app_session_id=SESSION_UUID" \
  -H "x-api-key: YOUR_ANALYTICS_KEY"
```

Attempting ingestion without a verified key returns a 403 error with guidance on requesting access.

---

## Frontend Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Marketing & transparency landing |
| `/leaderboard` | Public | Ranked list with export tools |
| `/documentation` | Public | Developer guide rendered from `content/documentation.md` |
| `/developer` | Auth required | Manage apps, claims, API keys |
| `/analytics` | Auth required | Deep analytics for owned apps |
| `/sessions/[id]` | Auth required | Session explorer |
| `/terms`, `/privacy` | Public | Policies |

---

## Project Structure

```
swip-dashboard/
├── app/               # Next.js app router + API routes
├── components/        # Reusable UI building blocks
├── content/           # Markdown documentation
├── prisma/            # Database schema & migrations
├── src/lib/           # Server-side utilities (auth, cache, etc.)
├── public/            # Static assets (logos, icons)
└── scripts/           # Operational scripts (seed, analytics tests)
```

---

## Testing & Tooling

```bash
# Type-check and lint
npm run lint

# Run the Next.js build (includes TypeScript checks)
npm run build

# Inspect your data locally
npx prisma studio
```

For API exploration, import `postman_swip.json` into Postman or Bruno.

---

## Deployment

- **Vercel** – Zero-config deployment for the Next.js UI. Remember to set environment variables.  
- **Docker** – A production Dockerfile is planned; in the meantime deploy via Node runtime + process manager.  
- **Database** – Provision PostgreSQL 15+, run `npx prisma migrate deploy` during release.  
- **Caching** – Redis is optional but recommended for leaderboard caching.

---

## Contributing

We welcome community improvements! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-improvement`).
3. Commit with clear messages.
4. Ensure `npm run lint && npm run build` pass.
5. Open a pull request describing your change.

Before diving into ingestion-related work, review the SWIP SDK and Synheart Wear projects for context:

- [SWIP SDK](https://github.com/synheart-ai/swip) – Protocol specification, reference implementations, certification tooling.  
- [Synheart Wear](https://github.com/synheart-ai/synheart-wear) – Wearable adapters that feed biosignals into the SDK.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE).

---

## Support & Links

- Documentation: https://dashboard.swip.app/documentation  
- Issues: https://github.com/synheart-ai/swip-dashboard/issues  
- Email: support@swip-dashboard.com

---

**Built with ❤️ for wellness transparency** – last updated November 2025.
