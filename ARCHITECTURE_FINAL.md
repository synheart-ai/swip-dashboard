# SWIP Dashboard - Final Architecture

## 🎯 Core Principle

**SWIP App is the ONLY source of data ingestion. Developers can only READ data.**

---

## 🔐 API Key Types

### 1. Swip App API Key (Dedicated)
- **Purpose**: Data ingestion only
- **Stored**: Developer API key assigned to the Swip app (`ai.synheart.swip`)
- **Access**: Full write access to create apps, sessions, biosignals, and emotions
- **Behavior**: When the authenticated app ID equals the Swip app ID, verification checks are bypassed
- **Endpoints**: 
  - `POST /api/v1/apps`
  - `POST /api/v1/app_sessions`
  - `POST /api/v1/app_biosignals`
  - `POST /api/v1/emotions`

### 2. Developer API Keys (Multiple, User-generated)
- **Purpose**: Read data only
- **Created**: Via Developer Portal
- **Access**: Read-only for their claimed apps
- **Endpoints**:
  - `GET /api/v1/apps`
  - `GET /api/v1/app_sessions`
  - `GET /api/v1/app_biosignals`
  - `GET /api/v1/emotions`
  - `DELETE /api/apps/{id}` (own apps only)

---

## 🏗️ Data Flow

### Scenario 1: SWIP App Creates App First

```
1. User installs SWIP App
   ↓
2. User allows tracking of "Calm" app
   ↓
3. SWIP App → POST /api/v1/apps
   Headers: x-api-key: {SWIP_APP_API_KEY}
   Body: { app_id: "com.calm.app", app_name: "Calm", ... }
   ↓
4. App created with:
   - ownerId: null
   - createdVia: "swip_app"
   - claimable: true
   ↓
5. Developer visits Dashboard
   ↓
6. Developer clicks "Claim App"
   ↓
7. Developer verifies ownership:
   - Uploads screenshot of app in console
   - OR enters package name confirmation
   - OR app store verification
   ↓
8. App claimed:
   - ownerId: {developer_user_id}
   - claimable: false
   ↓
9. Developer can now:
   - Generate API keys for that app
   - Read app data via API
   - Delete app
```

### Scenario 2: Developer Registers App First

```
1. Developer visits Dashboard
   ↓
2. Developer registers app manually
   - Selects OS (Android/iOS)
   - Enters App ID
   - Auto-fills from store
   ↓
3. App created with:
   - ownerId: {developer_user_id}
   - createdVia: "portal"
   - claimable: false
   ↓
4. When SWIP App tries to create same app:
   - Check if app_id exists
   - If exists: Link sessions to existing app
   - Don't create duplicate
```

---

## 🔒 API Endpoint Security

### Swip App Ingestion (Protected)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/apps` | POST | Developer API Key (Swip app) | Create/update app |
| `/api/v1/app_sessions` | POST | Developer API Key (Swip app) | Create session |
| `/api/v1/app_biosignals` | POST | Developer API Key (Swip app) | Bulk biosignal upload |
| `/api/v1/emotions` | POST | Developer API Key (Swip app) | Bulk emotion upload |

**Auth Header**: `x-api-key: {SWIP_APP_API_KEY}`

### Developer Read APIs (Protected)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/apps` | GET | Developer API Key | List apps |
| `/api/v1/app_sessions` | GET | Developer API Key | List sessions |
| `/api/v1/app_biosignals` | GET | Developer API Key | Get biosignals |
| `/api/v1/emotions` | GET | Developer API Key | Get emotions |

**Auth Header**: `x-api-key: {developer_api_key}`

### Developer Portal (Session Auth)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/apps` | POST | Session Cookie | Register app manually |
| `/api/apps` | GET | Session Cookie | List owned apps |
| `/api/apps/{id}` | DELETE | Session Cookie | Delete owned app |
| `/api/apps/{id}/claim` | POST | Session Cookie | Claim SWIP-created app |
| `/api/api-keys` | POST | Session Cookie | Generate API key |
| `/api/api-keys` | GET | Session Cookie | List API keys |
| `/api/api-keys/{id}` | PATCH | Session Cookie | Revoke/reactivate |
| `/api/api-keys/{id}` | DELETE | Session Cookie | Delete key |

---

## 📊 Database Schema Updates

### App Table

```prisma
model App {
  id            String    @id @default(cuid())
  name          String
  appId         String?   @unique  // Package name or bundle ID
  category      String?
  description   String?
  os            String?   // 'android', 'ios', 'web'
  iconUrl       String?
  developer     String?   // Developer name from store
  ownerId       String?   // Nullable - set when claimed
  createdVia    String    @default("portal") // 'portal' or 'swip_app'
  claimable     Boolean   @default(false) // true if created by SWIP App
  claimedAt     DateTime? // When claimed by developer
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  owner         User?     @relation(fields: [ownerId], references: [id])
  apiKeys       ApiKey[]
  swipSessions  SwipSession[]
  // ... other relations
  
  @@index([appId])
  @@index([ownerId])
  @@index([claimable])
}
```

### New Migration

```sql
ALTER TABLE "App" ADD COLUMN "createdVia" TEXT DEFAULT 'portal';
ALTER TABLE "App" ADD COLUMN "claimable" BOOLEAN DEFAULT false;
ALTER TABLE "App" ADD COLUMN "claimedAt" TIMESTAMP;
ALTER TABLE "App" ALTER COLUMN "ownerId" DROP NOT NULL;
```

---

## 🛠️ Implementation Tasks

### Phase 1: Security (Priority)

- [ ] Define `SWIP_APP_ID` constant for ingestion bypass
- [ ] Create ingestion auth helper using developer API keys
- [ ] Protect all POST `/api/v1/*` endpoints with ingestion auth helper
- [ ] Add rate limiting per API key type

### Phase 2: App Claiming

- [ ] Add `createdVia`, `claimable`, `claimedAt` fields to schema
- [ ] Create `POST /api/apps/{id}/claim` endpoint
- [ ] Add claim verification logic
- [ ] Update UI to show "Claim App" button
- [ ] Add claim history/audit log

### Phase 3: Developer Read APIs

- [ ] Update v1 GET endpoints to require developer API key
- [ ] Filter results by claimed apps only
- [ ] Add pagination
- [ ] Add comprehensive filters
- [ ] Update Swagger docs

### Phase 4: Documentation

- [ ] Update README with new architecture
- [ ] Update SWIP App API guide
- [ ] Add developer API examples
- [ ] Document claim process
- [ ] Update Swagger/OpenAPI spec

---

## 🔐 Security Implementation

### Ingestion Authentication

```typescript
// src/lib/auth-ingestion.ts
const SWIP_APP_ID = 'ai.synheart.swip';

export async function validateIngestionAuth(
  req: NextRequest,
  bodyAppId?: string | null
): Promise<IngestionAuthResult> {
  const apiKeyAuth = await validateDeveloperApiKey(req);

  if (!apiKeyAuth.valid) {
    return { valid: false, error: apiKeyAuth.error || 'Unauthorized' };
  }

  if (!apiKeyAuth.apiKey?.appExternalId) {
    return { valid: false, error: 'API key is not associated with an app' };
  }

  const appExternalId = apiKeyAuth.apiKey.appExternalId;
  const isSwipAppRequest =
    appExternalId === SWIP_APP_ID || (bodyAppId != null && bodyAppId === SWIP_APP_ID);

  if (bodyAppId != null && !isSwipAppRequest && bodyAppId !== appExternalId) {
    return {
      valid: false,
      error: `App ID mismatch: API key is for app ${appExternalId}, but request body specifies app ${bodyAppId}`
    };
  }

  if (!isSwipAppRequest && !(await isVerifiedApp(appExternalId))) {
    return {
      valid: false,
      error: `App ${appExternalId} is not verified for data ingestion`
    };
  }

  return {
    valid: true,
    isSwipApp: isSwipAppRequest,
    appId: appExternalId,
    userId: apiKeyAuth.userId
  };
}
```

### Developer API Key Validation

```typescript
// src/lib/auth-api-key.ts
export async function validateDeveloperApiKey(req: NextRequest) {
  const key = req.headers.get('x-api-key');
  
  if (!key) {
    return { valid: false, error: 'Missing API key' };
  }
  
  // Lookup using SHA-256 hash
  const lookupHash = createHash('sha256').update(key).digest('hex');
  const apiKey = await prisma.apiKey.findUnique({
    where: { lookupHash },
    include: { app: true, user: true }
  });
  
  if (!apiKey || apiKey.revoked) {
    return { valid: false, error: 'Invalid or revoked API key' };
  }
  
  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() }
  });
  
  return { 
    valid: true, 
    apiKey,
    userId: apiKey.user.id,
    appIds: apiKey.user.apps.map(a => a.id) // Can only read own apps
  };
}
```

---

## 📝 Updated API Examples

### SWIP App: Create App

```bash
curl -X POST https://swip.synheart.ai/api/v1/apps \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_SWIP_APP_API_KEY" \
  -d '{
    "app_id": "com.calm.app",
    "app_name": "Calm - Meditation & Sleep",
    "category": "Health",
    "developer": "Calm.com, Inc.",
    "os": "android"
  }'
```

### Developer: Read Apps

```bash
curl -X GET https://swip.synheart.ai/api/v1/apps \
  -H "x-api-key: YOUR_DEVELOPER_API_KEY"
```

Response (filtered to claimed apps only):
```json
{
  "apps": [
    {
      "id": "clxxx...",
      "app_id": "com.calm.app",
      "name": "Calm - Meditation & Sleep",
      "category": "Health",
      "totalSessions": 1234,
      "avgSwipScore": 85.2,
      "claimedAt": "2025-11-04T10:00:00Z"
    }
  ],
  "total": 1
}
```

### Developer: Claim App

```bash
curl -X POST https://swip.synheart.ai/api/apps/clxxx.../claim \
  -H "Cookie: better-auth.session_token=xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationMethod": "package_name",
    "proof": "com.calm.app"
  }'
```

---

## 🎯 Access Control Matrix

| Action | SWIP App | Developer (Unclaimed) | Developer (Claimed) | Public |
|--------|----------|----------------------|---------------------|--------|
| Create App | ✅ Yes | ✅ Yes (Portal) | ✅ Yes (Portal) | ❌ No |
| Create Session | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Create Biosignals | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Read Own Apps | ✅ Yes | ❌ No | ✅ Yes (API) | ❌ No |
| Read All Apps | ✅ Yes | ❌ No | ❌ No | ✅ Yes (Limited) |
| Claim App | ❌ No | ❌ No | ✅ Yes | ❌ No |
| Delete App | ❌ No | ❌ No | ✅ Yes (Own) | ❌ No |
| View Leaderboard | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🚀 Migration Strategy

### Step 1: Provision Swip App API Key

- Generate a dedicated developer API key for the Swip app (`ai.synheart.swip`)
- Store it securely in the operator password manager

### Step 2: Run Database Migration

```bash
npx prisma migrate dev --name add_app_claiming_fields
```

### Step 3: Update Existing Apps

```sql
-- Mark existing portal apps as not claimable
UPDATE "App" SET "claimable" = false WHERE "ownerId" IS NOT NULL;

-- Mark SWIP-created apps as claimable
UPDATE "App" SET "claimable" = true, "createdVia" = 'swip_app' WHERE "ownerId" IS NULL;
```

### Step 4: Deploy Code Changes

1. Deploy API protection
2. Deploy claim system
3. Deploy updated docs
4. Provide Swip app API key to SWIP App team

---

## 📞 Coordination with SWIP App Team

### Required Information to Share:

1. **New API Key**: Swip app developer API key (`x-api-key`)
2. **Header Format**: `x-api-key: {Swip app key}`
3. **Endpoint Changes**: All POST `/api/v1/*` require valid API key
4. **Duplicate Handling**: Check for existing `app_id` before creating
5. **Rate Limits**: 1000 req/min for SWIP key

---

**This architecture ensures:**
- ✅ Only SWIP App can ingest data
- ✅ Developers can read their claimed app data
- ✅ Developers can manually register apps
- ✅ Clear ownership and claiming process
- ✅ Secure API key management
- ✅ No public data ingestion

---

*Architecture finalized: November 4, 2025*

