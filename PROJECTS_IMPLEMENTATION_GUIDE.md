# Projects, Wearables & Sessions Implementation Guide

## 📋 Overview

This document explains how to implement the **Projects → Wearables → Sessions** hierarchy in the SWIP Dashboard, transforming the current flat app-based structure into a multi-tenant project management system.

---

## 🔍 Current Architecture Analysis

### Existing Models

1. **User Model**
   - Basic user with `isDeveloper` flag
   - Owns apps directly via `ownerId`
   - No team/collaboration support

2. **App Model**
   - Represents wellness applications
   - Single owner (`ownerId`)
   - Contains `appSessions` (sessions from SWIP App)

3. **Device Model**
   - Represents wearables (Apple Watch, Garmin, etc.)
   - Currently linked to `AppSession` via `deviceId`
   - No project association

4. **AppSession Model**
   - Sessions from SWIP App
   - Linked to `App` via `appInternalId`
   - Linked to `Device` via `deviceId`

### Current Routing Structure

```
/app/[appId]/sessions  → App-specific sessions
/developer              → App management
/sessions               → Global session explorer
```

### Limitations

- ❌ No project grouping (apps are standalone)
- ❌ No wearable management UI
- ❌ No team collaboration
- ❌ Sessions are app-scoped, not project-scoped
- ❌ No hierarchical navigation (Projects → Wearables 
                                          → Sessions)

---

## 🎯 Target Architecture

### New Hierarchy

```
Projects (Multi-tenant containers)
  ├── Team Members (if roles added)
  ├── Wearables (Devices assigned to project)
  └── Sessions (Scoped to project wearables)
```

### New Routes

```
/projects                                    → Projects list
/projects/[projectId]                        → Project dashboard
/projects/[projectId]/wearables              → Wearables management
/projects/[projectId]/wearables/new          → Add wearable wizard
/projects/[projectId]/sessions               → Sessions explorer
/projects/[projectId]/sessions/[sessionId]   → Session detail
```

---

## 🗄️ Database Schema Changes

### 1. Project Model (New)

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      String   @default("active") // active, archived, setup_incomplete
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastActivityAt DateTime?

  // Ownership
  ownerId     String
  owner       User     @relation("ProjectOwner", fields: [ownerId], references: [id])

  // Relations
  members     ProjectMember[]  // If roles are added
  wearables   Wearable[]
  sessions    ProjectSession[] // New model or link existing AppSession

  @@index([ownerId])
  @@index([status])
  @@index([lastActivityAt])
  @@map("project")
}
```

### 2. ProjectMember Model (Optional - if roles added)

```prisma
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  role      String   @default("member") // owner, admin, member, viewer
  joinedAt  DateTime @default(now())
  updatedAt DateTime @updatedAt

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation("ProjectMembers", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@map("project_member")
}
```

### 3. Wearable Model (Enhanced Device Model)

```prisma
model Wearable {
  id              String   @id @default(cuid())
  name            String   // User-assigned name (e.g., "Apple Watch #12")
  deviceType      String   // "Apple Watch", "Garmin", "Fitbit", etc.
  model           String?  // e.g., "Apple Watch Series 11"
  deviceId        String   @unique // External device ID (from Device.deviceId)
  
  // Project association
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // Connection status
  connectionStatus String  @default("disconnected") // connected, disconnected, needs_setup
  lastSyncAt      DateTime?
  batteryLevel    Int?     // 0-100 if available
  
  // User assignment
  assignedUserId  String?  // Optional user identifier within project
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  device          Device?  @relation(fields: [deviceId], references: [deviceId])
  sessions        ProjectSession[]

  @@index([projectId])
  @@index([deviceId])
  @@index([connectionStatus])
  @@index([deviceType])
  @@map("wearable")
}
```

### 4. ProjectSession Model (Links AppSession to Projects)

```prisma
model ProjectSession {
  id            String   @id @default(cuid())
  projectId     String
  wearableId    String?  // Optional - link to Wearable
  appSessionId  String   @unique // Reference to AppSession.appSessionId
  
  // Additional project-specific metadata
  notes         String?
  tags          String[] // Array of tags
  activityType  String?  // User-reported activity type
  userReportedMood String? // User-reported mood
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  wearable      Wearable? @relation(fields: [wearableId], references: [id])
  appSession    AppSession @relation(fields: [appSessionId], references: [appSessionId])

  @@index([projectId])
  @@index([wearableId])
  @@index([appSessionId])
  @@index([createdAt])
  @@map("project_session")
}
```

### 5. Update Existing Models

**User Model:**
```prisma
model User {
  // ... existing fields ...
  
  // New relations
  ownedProjects    Project[]        @relation("ProjectOwner")
  projectMemberships ProjectMember[] @relation("ProjectMembers")
}
```

**Device Model:**
```prisma
model Device {
  // ... existing fields ...
  
  // New relation
  wearable         Wearable?
}
```

**AppSession Model:**
```prisma
model AppSession {
  // ... existing fields ...
  
  // New relation
  projectSession   ProjectSession?
}
```

---

## 🔐 Authorization Strategy

### Without Roles (Simple)

- **Project Owner**: Full access (CRUD on project, wearables, sessions)
- **Non-owners**: No access (projects are private to owner)

### With Roles (Advanced)

Implement `ProjectMember` with role-based access:

| Role | Permissions |
|------|-------------|
| **owner** | Full access + delete project, manage members |
| **admin** | Full access except delete project |
| **member** | View + create/edit sessions, view wearables |
| **viewer** | Read-only access |

### Authorization Helper Functions

```typescript
// src/lib/project-auth.ts

export async function requireProjectAccess(
  userId: string,
  projectId: string,
  requiredRole?: 'owner' | 'admin' | 'member' | 'viewer'
): Promise<{ hasAccess: boolean; role?: string }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      members: {
        where: { userId },
      },
    },
  });

  if (!project) {
    return { hasAccess: false };
  }

  // Owner has full access
  if (project.ownerId === userId) {
    return { hasAccess: true, role: 'owner' };
  }

  // Check member role
  const membership = project.members[0];
  if (!membership) {
    return { hasAccess: false };
  }

  // Check role hierarchy if required
  if (requiredRole) {
    const roleHierarchy = { owner: 4, admin: 3, member: 2, viewer: 1 };
    const userRoleLevel = roleHierarchy[membership.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];
    
    if (userRoleLevel < requiredLevel) {
      return { hasAccess: false, role: membership.role };
    }
  }

  return { hasAccess: true, role: membership.role };
}
```

---

## 🛣️ Implementation Steps

### Phase 1: Database Migration

1. **Create migration file:**
   ```bash
   npx prisma migrate dev --name add_projects_hierarchy
   ```

2. **Update Prisma schema** with all new models

3. **Run migration:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

### Phase 2: API Routes

Create new API endpoints:

```
/app/api/projects/
  ├── route.ts                    → GET (list), POST (create)
  └── [projectId]/
      ├── route.ts                → GET, PATCH, DELETE
      ├── wearables/
      │   ├── route.ts            → GET (list), POST (add)
      │   └── [wearableId]/
      │       └── route.ts        → GET, PATCH, DELETE
      └── sessions/
          ├── route.ts            → GET (list with filters)
          └── [sessionId]/
              └── route.ts        → GET, PATCH
```

### Phase 3: Frontend Pages

1. **Projects List Page** (`/app/projects/page.tsx`)
   - Project cards with summary metrics
   - Create project modal
   - Search/filter functionality

2. **Project Dashboard** (`/app/projects/[projectId]/page.tsx`)
   - KPIs: Total wearables, active sessions, avg SWIP score
   - Recent activity feed
   - Team members list (if roles added)
   - Quick navigation to wearables/sessions

3. **Wearables Management** (`/app/projects/[projectId]/wearables/page.tsx`)
   - Wearable cards/table
   - Connection status indicators
   - Add wearable button → wizard flow

4. **Sessions Explorer** (`/app/projects/[projectId]/sessions/page.tsx`)
   - Filterable sessions table
   - Date range, wearable, emotion filters
   - Bulk actions

5. **Session Detail** (`/app/projects/[projectId]/sessions/[sessionId]/page.tsx`)
   - Full session visualization
   - Bio-signal charts
   - Emotional intelligence section
   - Notes and tags

### Phase 4: Navigation Updates

Update `LayoutWrapper.tsx` sidebar to include Projects:

```typescript
{
  href: '/projects',
  label: 'Projects',
  icon: <ProjectsIcon />,
}
```

Add breadcrumb component for hierarchical navigation.

---

## 🔄 Migration Strategy

### Data Migration Script

Since you already have `Device` and `AppSession` data, create a migration script:

```typescript
// scripts/migrate-to-projects.ts

async function migrateToProjects() {
  // 1. For each User with apps, create a default project
  const users = await prisma.user.findMany({
    include: { apps: true },
  });

  for (const user of users) {
    if (user.apps.length === 0) continue;

    // Create a default project
    const project = await prisma.project.create({
      data: {
        name: `${user.name || user.email}'s Project`,
        description: 'Migrated from existing apps',
        ownerId: user.id,
        status: 'active',
      },
    });

    // 2. Link existing devices to project as wearables
    const devices = await prisma.device.findMany({
      include: {
        sessions: {
          where: {
            appInternalId: { in: user.apps.map(a => a.id) },
          },
        },
      },
    });

    for (const device of devices) {
      await prisma.wearable.create({
        data: {
          name: device.watchModel || `Device ${device.deviceId.slice(0, 8)}`,
          deviceType: device.platform || 'Unknown',
          model: device.watchModel,
          deviceId: device.deviceId,
          projectId: project.id,
          connectionStatus: 'disconnected', // Default
        },
      });
    }

    // 3. Link AppSessions to ProjectSessions
    for (const app of user.apps) {
      const appSessions = await prisma.appSession.findMany({
        where: { appInternalId: app.id },
      });

      for (const session of appSessions) {
        const wearable = await prisma.wearable.findFirst({
          where: {
            deviceId: session.deviceId || undefined,
            projectId: project.id,
          },
        });

        await prisma.projectSession.create({
          data: {
            projectId: project.id,
            wearableId: wearable?.id,
            appSessionId: session.appSessionId,
          },
        });
      }
    }
  }
}
```

---

## 📊 Key Implementation Considerations

### 1. Backward Compatibility

- Keep existing `/app/[appId]/sessions` route working
- Gradually migrate users to projects
- Provide migration UI in developer portal

### 2. Wearable Setup Wizard

The wizard should:
1. Detect available device types
2. Support multiple connection methods:
   - Direct Bluetooth (if browser supports)
   - Cloud service integration (Apple Health, Google Fit)
   - Manual device ID entry
3. Test data connection
4. Assign to project and user

### 3. Session Filtering

Implement efficient filtering:
- Use Prisma query optimization
- Add database indexes for common filters
- Consider Redis caching for frequently accessed filters

### 4. Real-time Updates

For connection status and battery levels:
- WebSocket or Server-Sent Events
- Polling fallback
- Update `lastSyncAt` on data ingestion

---

## 🎨 UI/UX Patterns

### Breadcrumb Navigation

```
Projects → Corporate Wellness Q4 → Wearables → Apple Watch #12 → Sessions → Meditation_2025_10_20
```

Use Next.js `usePathname()` and build breadcrumb dynamically.

### Quick Actions

- **Project Dashboard**: "Add Wearable" button
- **Wearables List**: "Start Session" for specific device
- **Sessions List**: "Compare Sessions" for selected items

### Bulk Operations

- Multi-select with checkboxes
- Bulk export (CSV/JSON)
- Bulk tagging
- Bulk notes

---

## 🚀 Getting Started

1. **Review this guide** and decide on roles (simple vs. advanced)
2. **Update Prisma schema** with new models
3. **Run migration** and test locally
4. **Create API routes** following existing patterns
5. **Build frontend pages** using existing component library
6. **Update navigation** in LayoutWrapper
7. **Test end-to-end** flow: Create project → Add wearable → View sessions

---

## 📝 Next Steps

1. Decide on role system (simple owner-only or full RBAC)
2. Create database migration
3. Implement API routes
4. Build frontend pages
5. Add migration script for existing data
6. Update documentation

---

**Questions to Consider:**
- Should projects be private to owners, or support team collaboration?
- Do you need roles, or is owner-only sufficient initially?
- How should existing apps/devices be migrated to projects?
- Should there be a "default project" auto-created for existing users?

