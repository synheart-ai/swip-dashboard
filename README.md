# SWIP Dashboard

An open-source transparency layer for the Synheart Wellness Impact Protocol (SWIP). The dashboard publishes anonymized wellness analytics, provides REST APIs for developers, and manages ingestion access for verified partners.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16%2B-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue.svg)

---

## Feature Highlights

- **Global leaderboard** of SWIP scores with export tools.
- **Session explorer** for biosignals and model-derived emotions.
- **Developer portal** for app registration, claims, and API keys.
- **REST APIs** separated into read-only analytics and gated ingestion surfaces.
- **Sharing utilities** (CSV/JSON/screenshot) for dashboards and reports.

Live service: **[swip.synheart.io](https://swip.synheart.io)**

---

## Architecture Overview

```
Wearables ─┐
           ├─> Synheart Wear adapters → SWIP SDK → Verified ingest API → PostgreSQL
Mobile App ┘

PostgreSQL + Redis → SWIP Dashboard API (Next.js App Router)
                   ↳ /api/v1/* analytics (x-api-key)
                   ↳ Developer portal (apps, keys, claims)
```

- Device integrations use [Synheart Wear](https://github.com/synheart-ai/synheart-wear).
- Applications ingest via the [SWIP SDK](https://github.com/synheart-ai/swip).
- Ingestion keys are locked to a single external `app_id`; analytics keys are scoped to owned apps.

---

## Developer Workflow

1. **Sign in** at `/auth` (Google/GitHub OAuth).
2. **Register or claim** your application in `/developer`.
3. **Generate an analytics API key** (keys shown once; store securely).
4. **Call the analytics API** using `x-api-key: YOUR_KEY`.
5. **Request ingestion verification** if you need to stream biosignals. Approved partners receive a dedicated ingestion key tied to their `app_id`.
6. **Integrate the SWIP SDK + Synheart Wear adapters** to capture biometrics and send them to the dashboard.

> The first-party Synheart mobile app already has ingestion approval; third-party developers must complete the verification flow.

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (optional caching)

### Setup
```bash
git clone https://github.com/synheart-ai/swip-dashboard.git
cd swip-dashboard

npm install
cp env.example .env.local   # customise credentials

# Generate Prisma client and build Contentlayer types for docs
npx prisma migrate deploy
npx contentlayer build

npm run dev
```
Visit `http://localhost:3000`.

Notes:
- Docs pages use Contentlayer to compile MDX from `content/docs/*`. If you add or change docs, run `npx contentlayer build` or restart `npm run dev` to regenerate types.
- The build step is also wired to postinstall in package.json for CI/CD environments.

### Key Environment Variables
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/swip_dashboard"
BETTER_AUTH_SECRET="min-32-char-secret"
BETTER_AUTH_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"        # optional
```
See `env.example` for the complete list (OAuth, telemetry flags, etc.).

---

## API Overview

Base URL: `https://swip.synheart.io/api`

### Analytics (read-only)

| Endpoint | Description | Common params |
|----------|-------------|---------------|
| `GET /v1/apps` | Claimed apps with summary metrics. | `limit`, `category` |
| `GET /v1/app_sessions` | Paginated sessions for owned apps. | `app_id`, `limit` |
| `GET /v1/app_biosignals` | Biosignals for a session. | `app_session_id` (required) |
| `GET /v1/emotions` | Emotion events for a session/biosignal. | `app_session_id`, `app_biosignal_id` |
| `GET /public/stats` | Global anonymized statistics. | — |

All analytics requests must include `x-api-key: YOUR_ANALYTICS_KEY`.

### Ingestion (verified partners only)

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/apps` | Upsert app metadata. |
| `POST /v1/app_sessions` | Create/update sessions. |
| `DELETE /v1/app_sessions` | Delete all sessions and related data for a device and user. |
| `POST /v1/app_biosignals` | Bulk biosignal ingest (array). |
| `POST /v1/emotions` | Bulk emotion ingest (array). |

Ingestion keys are restricted to a single external `app_id`; payload mismatches return `403 Forbidden`.

### Emotion labels (production model)

| Label | Meaning |
|-------|---------|
| `calm` | Relaxed, low stress baseline |
| `stressed` | Elevated physiological stress |
| `focused` | Sustained attentive state |

Legacy exports may contain historical labels (`happy`, `neutral`, etc.), but new events always use the three states above.

#### Example

```bash
curl -X GET "https://swip.synheart.io/api/v1/app_sessions?app_id=com.synheart.focus&limit=20" \
  -H "x-api-key: ${SWIP_ANALYTICS_KEY}"
```

##### Delete all sessions and related data for a device and user

```bash
curl -X DELETE "https://swip.synheart.io/api/v1/app_sessions" \
  -H "x-api-key: ${SWIP_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "DEVICE_ID", "user_id": "USER_ID"}'
```

- This will delete all sessions and related biosignal data for the given `device_id` and `user_id`.
- Requires a valid ingestion (app) API key.

---

## SWIP Score & Rate Limits

- **SWIP Score** (0–100) = `phys_subscore (0–60)` + `emo_subscore (0–40)`.
- **Rate limits**

  | Endpoint group | Limit | Window |
  |----------------|-------|--------|
  | `/v1/apps`, `/v1/app_sessions` | 120 requests | 60 seconds |
  | `/v1/app_biosignals`, `/v1/emotions` | 60 requests | 60 seconds |

- **Error payload**
  ```json
  {
    "success": false,
    "error": "Unauthorized: Invalid or missing authentication",
    "message": "This endpoint requires x-api-key header"
  }
  ```

---

## Code Examples

Example developer used in docs: **Israel Goytom**

### Node.js
```javascript
const fetch = require('node-fetch');

const API_KEY = process.env.SWIP_API_KEY;
const BASE_URL = 'https://swip.synheart.io/api/v1';

async function getApps(limit = 10) {
  const res = await fetch(`${BASE_URL}/apps?limit=${limit}`, {
    headers: { 'x-api-key': API_KEY },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.apps;
}
```

### Python
```python
import os
import requests

API_KEY = os.getenv("SWIP_API_KEY")
BASE_URL = "https://swip.synheart.io/api/v1"

def get_biosignals(session_id):
    response = requests.get(
        f"{BASE_URL}/app_biosignals",
        params={"app_session_id": session_id},
        headers={"x-api-key": API_KEY},
    )
    data = response.json()
    if not data.get("success"):
        raise RuntimeError(data.get("error"))
    return data["biosignals"]
```

### cURL
```bash
# List your apps
curl -X GET "https://swip.synheart.io/api/v1/apps?limit=10" \
  -H "x-api-key: ${SWIP_ANALYTICS_KEY}"

# Fetch emotions for a session
curl -X GET "https://swip.synheart.io/api/v1/emotions?app_session_id=SESSION_UUID" \
  -H "x-api-key: ${SWIP_ANALYTICS_KEY}"
```

---

## Project Structure

```
swip-dashboard/
├── app/             # Next.js App Router & API routes
├── components/      # Reusable UI components
├── content/         # Markdown documentation
├── prisma/          # Database schema & migrations
├── public/          # Static assets (logos, icons)
├── scripts/         # Operational scripts (analytics tests, seeds)
└── src/lib/         # Server utilities (auth, cache, logging)
```

---

## Documentation System (Contentlayer + Fumadocs UI)

- Source files: `content/docs/**/*.mdx`
- Type generation: Contentlayer compiles MDX into typed data under `contentlayer/generated`.
- Rendering: Pages at `app/[lang]/docs/[...slug]/page.tsx` use `@fumadocs/ui` (`DocsLayout`, `DocsContent`) to render the MDX component.
- Frontmatter:
  - `title` (required) – displayed in layout and metadata
  - `description` (optional) – used for meta and previews
  - `lang` (optional, default `en`) – route language filter

Example frontmatter:
```mdx
---
title: Introduction
description: Overview of the SWIP dashboard and APIs
lang: en
---
```

Developer tips:
- If you see "contentlayer/generated not found", ensure `contentlayer.config.ts` exists at the repo root and run:
  ```bash
  npx contentlayer build
  ```
- If you see "@fumadocs/ui cannot be found", install it:
  ```bash
  npm install @fumadocs/ui
  ```
  The package is already declared in `package.json` for this project.
- If Next.js fails to load `next.config.mjs` due to missing `next-contentlayer`, this repository is resilient and will start without the plugin. To enable the docs pipeline fully, install the packages and build Contentlayer:
  ```bash
  npm install next-contentlayer contentlayer remark-gfm
  npx contentlayer build
  ```

## Testing & Tooling

```bash
npm run lint          # ESLint + TypeScript checks
npm run build         # Production build
npx prisma studio     # Inspect data locally
```

Import `postman_swip.json` into Postman/Bruno for quick API exploration.

---

## Deployment Notes

- **Vercel** – Zero-config for the Next.js UI (set env vars).
- **Containers** – Build with Node + process manager; run `npx prisma migrate deploy`.
- **PostgreSQL** – Minimum v15 with connection pooling.
- **Redis** – Optional cache for leaderboards and analytics snapshots.

---

## Contributing

1. Fork this repository.
2. `git checkout -b feature/amazing-change`
3. Ensure `npm run lint && npm run build` pass.
4. Submit a pull request describing the improvement.

Helpful context:
- SWIP SDK: [synheart-ai/swip](https://github.com/synheart-ai/swip)
- Synheart Wear adapters: [synheart-ai/synheart-wear](https://github.com/synheart-ai/synheart-wear)

---

## License

MIT – see [LICENSE](LICENSE).

---

## Support & Links

- Documentation: [swip.synheart.io/documentation](https://swip.synheart.io/documentation)  
- Issues: [synheart-ai/swip-dashboard/issues](https://github.com/synheart-ai/swip-dashboard/issues)  
- Email: support@swip.synheart.io  
- API health: `GET /api/health`

---

**Built with ❤️ for wellness transparency**  
Last updated: December 2025.
