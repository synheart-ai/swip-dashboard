# Implementation Plan - Secure Architecture

## 🎯 Goal

Implement the corrected architecture where:
1. **SWIP App** = Only data ingestion source (protected)
2. **Developers** = Read-only API access (protected)
3. **App Claiming** = Two-path registration system

---

## 📋 Tasks Checklist

### Phase 1: Security & Protection (CRITICAL)

#### Task 1.1: Add SWIP Internal Key
- [ ] Add `SWIP_INTERNAL_API_KEY` to `.env.local`
- [ ] Add to `env.example` with documentation
- [ ] Add to Vercel environment variables

#### Task 1.2: Create Auth Middleware
- [ ] Create `src/lib/auth-swip.ts`
  - `validateSwipInternalKey(req)` function
  - Return boolean
- [ ] Create `src/lib/auth-developer-key.ts`
  - `validateDeveloperApiKey(req)` function
  - Return user and owned app IDs
  
#### Task 1.3: Protect POST Endpoints
- [ ] Update `/api/v1/apps` POST - require SWIP key
- [ ] Update `/api/v1/app_sessions` POST - require SWIP key
- [ ] Update `/api/v1/app_biosignals` POST - require SWIP key
- [ ] Update `/api/v1/emotions` POST - require SWIP key
- [ ] Update `/api/swip/ingest` POST - require SWIP key (or deprecate)

#### Task 1.4: Protect GET Endpoints
- [ ] Update `/api/v1/apps` GET - require developer API key
- [ ] Update `/api/v1/app_sessions` GET - require developer API key
- [ ] Update `/api/v1/app_biosignals` GET - require developer API key
- [ ] Update `/api/v1/emotions` GET - require developer API key
- [ ] Filter results to only claimed apps

---

### Phase 2: Database Schema Updates

#### Task 2.1: Add New Fields
- [ ] Update `prisma/schema.prisma`:
  ```prisma
  model App {
    // ... existing fields
    createdVia    String    @default("portal") // 'portal' or 'swip_app'
    claimable     Boolean   @default(false)
    claimedAt     DateTime?
    // Make ownerId nullable
    ownerId       String?
  }
  ```

#### Task 2.2: Create Migration
- [ ] Run: `npx prisma migrate dev --name add_app_claiming`
- [ ] Verify migration in `prisma/migrations/`

#### Task 2.3: Update Existing Data
- [ ] Create script: `scripts/update-existing-apps.ts`
  ```typescript
  // Mark portal apps as not claimable
  await prisma.app.updateMany({
    where: { ownerId: { not: null } },
    data: { claimable: false, createdVia: 'portal' }
  });
  
  // Mark SWIP apps as claimable
  await prisma.app.updateMany({
    where: { ownerId: null },
    data: { claimable: true, createdVia: 'swip_app' }
  });
  ```
- [ ] Run script

---

### Phase 3: App Claiming System

#### Task 3.1: Create Claim API
- [ ] Create `/api/apps/[id]/claim/route.ts`
  - POST endpoint
  - Require session auth
  - Accept verification proof
  - Update app: set ownerId, claimedAt, claimable=false

#### Task 3.2: Add Verification Logic
- [ ] Package name confirmation
- [ ] Store verification proof in database
- [ ] Send notification email (optional)

#### Task 3.3: Update UI
- [ ] Add "Claimable Apps" section to Developer Portal
- [ ] Add "Claim App" button
- [ ] Create claim modal/panel
- [ ] Add verification form

#### Task 3.4: Add Audit Trail
- [ ] Create `AppClaimHistory` table (optional)
- [ ] Log all claim attempts
- [ ] Show claim history in admin panel

---

### Phase 4: API Filtering & Permissions

#### Task 4.1: Update v1 GET Endpoints
- [ ] `/api/v1/apps` GET:
  - Extract user from API key
  - Filter to apps where `ownerId = userId`
  - Add pagination
- [ ] `/api/v1/app_sessions` GET:
  - Filter to sessions of claimed apps
  - Add `appId` query filter
- [ ] `/api/v1/app_biosignals` GET:
  - Require `appSessionId` param
  - Verify session belongs to claimed app
- [ ] `/api/v1/emotions` GET:
  - Same logic as biosignals

#### Task 4.2: Add Permission Checks
- [ ] Helper: `canAccessApp(userId, appId)`
- [ ] Helper: `canAccessSession(userId, sessionId)`
- [ ] Use in all GET endpoints

---

### Phase 5: Documentation Updates

#### Task 5.1: Update README
- [ ] Add SWIP Internal Key section
- [ ] Update API endpoint table
- [ ] Add app claiming workflow
- [ ] Update security section

#### Task 5.2: Update SWIP App API Guide
- [ ] Document required `x-swip-internal-key` header
- [ ] Update all POST examples
- [ ] Add error responses (401, 403)
- [ ] Add rate limit info

#### Task 5.3: Update Developer API Guide
- [ ] Document `x-api-key` header for GET
- [ ] Show filtering behavior
- [ ] Add claim API examples
- [ ] Document permissions

#### Task 5.4: Update Swagger
- [ ] Add `SwipInternalAuth` security scheme
- [ ] Add `DeveloperApiKeyAuth` security scheme
- [ ] Mark POST endpoints with SWIP auth
- [ ] Mark GET endpoints with developer auth

---

### Phase 6: Testing

#### Task 6.1: Test SWIP Key Protection
- [ ] POST without key → 401
- [ ] POST with wrong key → 403
- [ ] POST with valid key → 200
- [ ] Test all 4 POST endpoints

#### Task 6.2: Test Developer Key Protection
- [ ] GET without key → 401
- [ ] GET with revoked key → 403
- [ ] GET with valid key → 200 (filtered)
- [ ] Verify filtering works (can't see others' apps)

#### Task 6.3: Test App Claiming
- [ ] Create app via SWIP (should be claimable)
- [ ] Create app via portal (should not be claimable)
- [ ] Claim unclaimed app → success
- [ ] Claim already-claimed app → error
- [ ] Claim non-existent app → error

#### Task 6.4: E2E Workflow
- [ ] SWIP creates app
- [ ] SWIP creates sessions/biosignals
- [ ] Developer claims app
- [ ] Developer generates API key
- [ ] Developer reads data via API
- [ ] Verify data isolation

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Migration tested locally
- [ ] SWIP team notified of changes

### Deployment Steps
1. [ ] Set `SWIP_INTERNAL_API_KEY` in production env
2. [ ] Deploy code to staging
3. [ ] Run migration: `npx prisma migrate deploy`
4. [ ] Test on staging
5. [ ] Deploy to production
6. [ ] Verify all endpoints
7. [ ] Monitor error logs

### Post-Deployment
- [ ] Share SWIP key with SWIP App team
- [ ] Update developer documentation
- [ ] Send email to existing developers about changes
- [ ] Monitor API usage

---

## 📝 Code Examples

### Protected POST Endpoint

```typescript
// app/api/v1/apps/route.ts
import { validateSwipInternalKey } from '@/src/lib/auth-swip';

export async function POST(req: NextRequest) {
  // Validate SWIP internal key
  const isValid = await validateSwipInternalKey(req);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing SWIP internal key' },
      { status: 401 }
    );
  }
  
  // Rate limiting for SWIP key
  const rateLimitResult = await rateLimit.swipInternal(req);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // Continue with app creation...
  const body = await req.json();
  // ...
}
```

### Protected GET Endpoint

```typescript
// app/api/v1/apps/route.ts
import { validateDeveloperApiKey } from '@/src/lib/auth-developer-key';

export async function GET(req: NextRequest) {
  // Validate developer API key
  const auth = await validateDeveloperApiKey(req);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Filter to only claimed apps
  const apps = await prisma.app.findMany({
    where: {
      ownerId: auth.userId,
      claimable: false, // Already claimed
    },
    include: {
      _count: {
        select: { swipSessions: true }
      }
    }
  });
  
  return NextResponse.json({ apps });
}
```

### Claim Endpoint

```typescript
// app/api/apps/[id]/claim/route.ts
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireUser(req);
  const { id } = await params;
  const body = await req.json();
  
  // Find app
  const app = await prisma.app.findUnique({
    where: { id }
  });
  
  if (!app) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }
  
  if (!app.claimable) {
    return NextResponse.json(
      { error: 'App is not claimable' },
      { status: 400 }
    );
  }
  
  if (app.ownerId) {
    return NextResponse.json(
      { error: 'App already claimed' },
      { status: 409 }
    );
  }
  
  // Verify ownership (simple version)
  if (body.verificationMethod === 'package_name') {
    if (body.proof !== app.appId) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 403 }
      );
    }
  }
  
  // Claim app
  const updatedApp = await prisma.app.update({
    where: { id },
    data: {
      ownerId: session.user.id,
      claimedAt: new Date(),
      claimable: false,
    }
  });
  
  return NextResponse.json({
    success: true,
    app: updatedApp
  });
}
```

---

## ⚠️ Breaking Changes

### For SWIP App Team
- **Action Required**: Add `x-swip-internal-key` header to all POST requests
- **Endpoints Affected**: All `/api/v1/*` POST endpoints
- **Timeline**: Implement before next release

### For Existing Developers
- **Impact**: No breaking changes (read APIs still work)
- **Enhancement**: Can now claim SWIP-created apps
- **Action**: Optional - claim apps in portal

---

## 📞 Communication Plan

### To SWIP App Team
**Subject**: [Action Required] New API Key for SWIP Dashboard Integration

**Message**:
```
Hi SWIP Team,

We've updated the SWIP Dashboard architecture for enhanced security.

REQUIRED CHANGES:
1. Add this header to all POST requests:
   x-swip-internal-key: {KEY_PROVIDED_SEPARATELY}

2. Affected endpoints:
   - POST /api/v1/apps
   - POST /api/v1/app_sessions
   - POST /api/v1/app_biosignals
   - POST /api/v1/emotions

3. Rate limit: 1000 requests/minute

4. Deadline: [DATE]

Updated documentation: https://dashboard.swip.app/documentation

Questions? Reply to this email.
```

### To Developers
**Subject**: New Feature: Claim Your App on SWIP Dashboard

**Message**:
```
Hi Developers,

Exciting update! You can now claim apps that were automatically 
created by the SWIP App.

NEW FEATURES:
✅ View apps tracked by SWIP users
✅ Claim ownership with simple verification
✅ Generate API keys to read your app's data
✅ Access detailed wellness metrics

How to claim: Visit your Developer Portal → "Claimable Apps" section

Learn more: https://dashboard.swip.app/documentation
```

---

## 🎯 Success Criteria

- [ ] All POST endpoints protected with SWIP key
- [ ] All GET endpoints protected with developer key
- [ ] App claiming system functional
- [ ] SWIP App team integrated successfully
- [ ] Zero unauthorized data access attempts
- [ ] Developer adoption of claiming feature
- [ ] Documentation complete and accurate

---

**Estimated Timeline**: 2-3 days  
**Priority**: HIGH (Security)  
**Dependencies**: SWIP App team coordination

---

*Plan created: November 4, 2025*

