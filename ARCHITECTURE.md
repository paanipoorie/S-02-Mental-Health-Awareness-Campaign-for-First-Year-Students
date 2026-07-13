# Campus Anonymous Peer Support Platform — Architecture Documentation

## 1. Project Overview

### Purpose
The Campus Anonymous Peer Support Platform is a privacy-first mental health awareness and support platform designed specifically for first-year university students. It provides a safe, anonymous environment where students can share experiences, connect with verified mentors, access mental health resources, and participate in peer support activities — all without revealing their real identities.

### Target Users
- **Primary**: First-year university students experiencing transition stress, homesickness, academic pressure, loneliness, anxiety, or other mental health challenges
- **Secondary**: Verified mentors (senior students, faculty advisors, trained peer supporters) who provide guidance and support
- **Administrative**: Platform administrators who manage mentor verification, content moderation, and platform analytics

### Core Goals
1. **Reduce stigma** around mental health by normalizing anonymous peer discussions
2. **Increase awareness** of available campus mental health resources
3. **Enable early intervention** through emotional status tracking and mentor prioritization
4. **Build community** through anonymous posts, real-time chat, meetings, and workshops
5. **Maintain absolute privacy** — student identities are never exposed to peers or mentors

### Privacy-First Philosophy
- **Zero identity exposure**: Student real identities (email, name, ID) are never visible to other students or mentors
- **Anonymous identity layer**: Every student receives a persistent, human-readable anonymous identity (e.g., "Anonymous Sparrow") used across all platform features
- **Strict database separation**: Feature tables reference `AnonymousIdentity.id`, never `User.id`
- **Service-layer enforcement**: Auth service is the only component allowed to join `AnonymousIdentity → User`
- **Audit logging**: All admin actions are logged for accountability

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Astro      │    │   Socket.io  │    │   Fetch/     │                   │
│  │   Frontend   │◄───│   Client     │───►│   REST API   │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                   │
└─────────┼───────────────────┼────────────────────┼───────────────────────────┘
          │                   │                    │
          │ HTTPS             │ WebSocket          │ HTTPS
          ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXPRESS BACKEND (apps/api)                       │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   Auth &     │    │   REST API   │    │  Socket.io   │    │  Service │  │
│  │   Middleware │───►│   Routes     │───►│   Server     │───►│  Layer   │  │
│  └──────────────┘    └──────┬───────┘    └──────┬───────┘    └────┬─────┘  │
│                             │                   │                 │        │
│                             ▼                   ▼                 ▼        │
│                    ┌─────────────────────────────────────────────────────┐  │
│                    │                    SERVICE LAYER                     │  │
│                    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│                    │  │ Auth Svc │ │ Post Svc │ │ Chat Svc │ │ ...    │  │  │
│                    │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬───┘  │  │
│                    └───────┼────────────┼───────────┼────────────┼───────┘  │
│                            ▼            ▼           ▼            ▼          │
│                    ┌─────────────────────────────────────────────────────┐  │
│                    │                     PRISMA ORM                       │  │
│                    └────────────────────────┬────────────────────────────┘  │
└──────────────────────────────────────────────┼──────────────────────────────┘
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL DATABASE                                  │
│  ┌──────────┐ ┌──────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  User    │ │Anonymous     │ │  Post   │ │  Chat    │ │  Meeting/    │  │
│  │          │ │  Identity    │ │         │ │          │ │  Workshop    │  │
│  └──────────┘ └──────────────┘ └─────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Emotion  │ │  Mentor      │ │ Resource│ │ Admin    │ │ Notification │  │
│  │   Log    │ │  Profile     │ │         │ │ Action   │ │              │  │
│  └──────────┘ └──────────────┘ └─────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Interactions

| Component | Role | Interactions |
|-----------|------|--------------|
| **Astro Frontend** | SSR/SSG rendered pages with interactive islands | REST calls to Express API, WebSocket to Socket.io for real-time features |
| **Express Backend** | REST API, business logic, auth, validation | Prisma ORM for DB, Socket.io for real-time, JWT for auth |
| **PostgreSQL** | Primary persistent storage | Prisma ORM manages schema, migrations, queries |
| **Prisma** | Type-safe database access | Schema-defined models, migrations, type generation |
| **Socket.io** | Real-time bidirectional communication | Auth via JWT handshake, rooms for chat threads, presence broadcasting |
| **Docker** | Container orchestration | Multi-service deployment (web, api, postgres) with health checks |

---

## 3. Monorepo Structure

```
campus-peer-support/
├── apps/
│   ├── web/                    # Astro Frontend Application
│   │   ├── src/
│   │   │   ├── pages/          # File-based routing (Astro pages + API routes)
│   │   │   ├── layouts/        # BaseLayout, StudentLayout, MentorLayout, AdminLayout
│   │   │   ├── components/     # Reusable UI components (organized by feature)
│   │   │   ├── styles/         # Global styles, Tailwind imports
│   │   │   ├── lib/            # API client, auth helpers, socket client
│   │   │   ├── stores/         # Nanostores for client state (auth, UI)
│   │   │   └── env.d.ts        # TypeScript env declarations
│   │   ├── public/             # Static assets
│   │   ├── astro.config.mjs    # Astro configuration
│   │   ├── tailwind.config.cjs # Tailwind CSS configuration
│   │   └── tsconfig.json       # TypeScript config
│   │
│   └── api/                    # Express Backend Application
│       ├── src/
│       │   ├── config/         # Environment configuration (env.ts)
│       │   ├── routes/         # API route definitions (/api/*)
│       │   ├── controllers/    # Request handlers, response formatting
│       │   ├── services/       # Business logic, data access, external integrations
│       │   ├── middlewares/    # Auth, RBAC, validation, error handling, rate limiting
│       │   ├── validators/     # Zod schemas for request validation
│       │   ├── utils/          # Helpers (jwt, hash, logger, ApiError)
│       │   ├── sockets/        # Socket.io setup, event handlers
│       │   ├── prisma/         # Prisma client, schema, seed
│       │   ├── types/          # Express request augmentation
│       │   ├── app.ts          # Express app factory
│       │   └── server.ts       # Entry point, server startup
│       ├── prisma/
│       │   └── schema.prisma   # Database schema
│       └── tsconfig.json
│
├── packages/
│   └── shared-types/           # Shared TypeScript types & enums
│       ├── src/
│       │   ├── enums.ts        # Role, EmotionType, UrgencyLevel, MeetingType, etc.
│       │   ├── entities.ts     # Shared DTO interfaces
│       │   └── index.ts        # Barrel export
│       └── package.json
│
├── docker/
│   ├── web.Dockerfile          # Multi-stage Astro build
│   ├── api.Dockerfile          # Multi-stage Express build
│   └── docker-compose.yml      # Local development orchestration
│
├── docs/
│   ├── phase.md                # 16-phase development roadmap
│   └── design.md               # Geist design system tokens
│
├── .eslintrc.cjs               # ESLint config (shared)
├── .prettierrc                 # Prettier config
├── pnpm-workspace.yaml         # pnpm workspace config
├── package.json                # Root scripts, devDependencies
├── tsconfig.json               # Root TypeScript config
└── README.md                   # Project documentation
```

### Why This Structure?

| Directory | Purpose | Reasoning |
|-----------|---------|-----------|
| `apps/web` | Frontend | Astro's file-based routing, island architecture for interactivity |
| `apps/api` | Backend | Express with layered architecture (routes → controllers → services) |
| `packages/shared-types` | Type safety | Single source of truth for enums, DTOs shared across frontend/backend |
| `docker/` | Containerization | Separate Dockerfiles for web/api, compose for local dev |
| `docs/` | Documentation | Architecture, design system, roadmap in one place |

---

## 4. Request Flow

### REST API Request Lifecycle

```
Browser (Astro)
       │
       ▼
┌──────────────────┐
│  Astro Page/     │  1. User interaction (form submit, link click)
│  API Endpoint    │
└────────┬─────────┘
         │ fetch() with JWT in Authorization header / httpOnly cookie
         ▼
┌──────────────────┐
│  Express API     │  2. Request hits Express server
│  (apps/api)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Global Middleware│  3. helmet, cors, compression, cookie-parser, body-parser
│  Stack            │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Auth Middleware  │  4. Verify JWT → attach req.user { userId, role, email }
│  (auth.middleware)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  RBAC Middleware  │  5. requireRole(['STUDENT']), requireVerifiedMentor()
│  (role.middleware)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Validation       │  6. Zod schema validates body/query/params
│  Middleware       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Route Handler    │  7. Controller method invoked
│  (Controller)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Service Layer    │  8. Business logic, data access, cross-service calls
│  (Service)        │     Uses Prisma Client for DB operations
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Prisma ORM       │  9. Type-safe database queries
│  (schema.prisma)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  PostgreSQL       │  10. Data persisted / retrieved
└────────┬─────────┘
         │
         ▼
    Response flows back through layers
         │
         ▼
┌──────────────────┐
│  Error Middleware │  Centralized error handling (ApiError, ZodError, PrismaError)
└────────┬─────────┘
         │
         ▼
    JSON Response to Client
```

### Socket.io Communication Flow

```
Client (Socket.io)                    Server (Socket.io)
      │                                    │
      │  1. connect({ auth: { token } })   │
      ├───────────────────────────────────►│
      │                                    │  2. JWT verification in handshake
      │                                    │     middleware → attach socket.user
      │                                    │
      │  3. chat:join { threadId }         │
      ├───────────────────────────────────►│
      │                                    │  4. Authorization: user must be
      │                                    │     participant in thread
      │                                    │
      │                                    │  5. socket.join(threadId)
      │                                    │
      │  6. chat:message { body }          │
      ├───────────────────────────────────►│
      │                                    │  7. Persist to ChatMessage
      │                                    │  8. Broadcast to thread room
      │                                    │  9. Trigger notification for
      │                                    │     other participant
      │                                    │
      ◄────────────────────────────────────┤
      │  10. chat:message (broadcast)      │
      │                                    │
      ◄────────────────────────────────────┤
      │  11. notification:new              │  (if other user offline/different tab)
```

**Key Socket.io Design Decisions:**
- JWT authentication during handshake (not after connect)
- Room per chat thread (`thread:${threadId}`)
- Mentor presence broadcast via `presence:update` events
- All socket payloads use `AnonymousIdentity` references, never `User`

---

## 5. Authentication Architecture

### Overview
Authentication follows a JWT-based session model with strict separation between real identity (auth layer) and anonymous identity (feature layer).

### Registration Flow (Student)
```
POST /api/auth/register
  │
  ▼
Validate university email domain (@university.edu)
  │
  ▼
Hash password (bcrypt, 12 rounds)
  │
  ▼
Create User { role: STUDENT, isVerifiedMentor: false }
  │
  ▼
Auto-create AnonymousIdentity
  │  - displayName: "Anonymous Sparrow" (adjective + noun from word banks)
  │  - avatarSeed: random integer for consistent avatar generation
  │  - userId: 1:1 link to User
  ▼
Return JWT (access + optional refresh token)
```

### Login Flow
```
POST /api/auth/login
  │
  ▼
Verify credentials
  │
  ▼
Issue JWT payload: { userId, role, email }
  │
  ▼
Client stores tokens (httpOnly cookie preferred)
```

### Protected Route Access
```
Request + JWT
     │
     ▼
auth.middleware.ts → verify JWT → attach req.user { userId, role, email }
     │
     ▼
Route handler → Service layer
     │
     ▼
Service needing anonymous identity:
  identityService.getAnonymousIdentity(userId)
     │
     ▼
Returns { anonymousIdentityId, displayName, avatarSeed }
```

### Identity Separation Enforcement

| Layer | Can Access `User` | Can Access `AnonymousIdentity` |
|-------|-------------------|-------------------------------|
| Auth Middleware | ✅ (for JWT verification) | ❌ |
| Auth Service | ✅ (registration, login) | ✅ (creation) |
| Identity Service | ❌ | ✅ (lookup, creation) |
| Feature Services (Post, Chat, Meeting) | ❌ | ✅ (only) |
| Controllers | ❌ | ✅ (via service) |
| Frontend | Never | ✅ (via API responses) |

**Critical Rule**: No feature service or controller ever receives or returns `User.id` or `User.universityEmail` for student-generated content. Only `AnonymousIdentity` fields are exposed.

### Token Management
- **Access Token**: 15 min expiry, stored in memory (not localStorage)
- **Refresh Token**: 7 day expiry, httpOnly secure cookie
- **Rotation**: Refresh rotates access token; old refresh token invalidated
- **Secrets**: `JWT_SECRET`, `JWT_REFRESH_SECRET` from environment (min 32 chars)

---

## 6. Anonymous Identity Architecture

### Design Philosophy
The anonymous identity system is the **core privacy primitive** of the platform. It exists to solve a fundamental tension: students need persistent reputation and recognition within the community, but must never be linkable to their real identity.

### Data Model

```prisma
model User {
  id                    String   @id @default(cuid())
  universityEmail       String   @unique
  passwordHash          String
  role                  Role     @default(STUDENT)
  isVerifiedMentor      Boolean  @default(false)
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  anonymousIdentity     AnonymousIdentity?
}

model AnonymousIdentity {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  displayName     String   @unique  // "Anonymous Sparrow"
  avatarSeed      Int      // deterministic avatar generation
  createdAt       DateTime @default(now())
  
  // Relations to all student-generated content
  posts           Post[]
  postReplies     PostReply[]
  emotionLogs     EmotionLog[]
  chatThreads     ChatThread[]
  chatMessages    ChatMessage[]
  meetingAttendees MeetingAttendee[]
  workshopRegistrations WorkshopRegistration[]
}
```

### Identity Generation Algorithm
```typescript
// packages/shared-types/src/anonymousIdentity.ts
const ADJECTIVES = ['gentle', 'bright', 'calm', 'wise', 'kind', ...];
const NOUNS = ['sparrow', 'willow', 'river', 'meadow', 'star', ...];

function generateAnonymousName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `Anonymous ${capitalize(adj)} ${capitalize(noun)}`;
}

// Ensures uniqueness via DB constraint + retry loop
```

### Why This Design?
1. **Human-readable**: "Anonymous Sparrow" feels personal, not robotic
2. **Persistent**: Same identity across all features (posts, chat, meetings)
3. **Non-reversible**: No algorithmic way to derive `User` from `AnonymousIdentity`
4. **Database-enforced**: 1:1 User↔AnonymousIdentity, FK on all content tables
5. **Mentor distinction**: Mentors use real names (with verified badge), students never see mentor emails

### Exposure Rules
| Context | Student Sees | Mentor Sees |
|---------|--------------|-------------|
| Post author | "Anonymous Sparrow" | "Anonymous Sparrow" |
| Post reply (student) | "Anonymous Willow" | "Anonymous Willow" |
| Post reply (mentor) | "Verified Mentor" badge + mentor name | "Verified Mentor" + mentor name |
| Chat peer | "Anonymous Sparrow" | "Anonymous Sparrow" + current emotion |
| Meeting attendee | "Anonymous Sparrow" | "Anonymous Sparrow" |
| Workshop registration | "Anonymous Sparrow" | "Anonymous Sparrow" |

---

## 7. Data Flow

### Student Creates Post
```
Student (Browser)
     │
     ▼
POST /api/posts { title, body, emotion?, urgencyLevel?, category }
     │
     ▼
Auth Middleware → req.user { userId, role: STUDENT }
     │
     ▼
PostController.create()
     │
     ▼
PostService.create()
     │
     ├── identityService.getAnonymousIdentity(userId) → { anonymousIdentityId, displayName }
     ├── prisma.post.create({ anonymousIdentityId, title, body, ... })
     │
     ▼
Return Post with author: { anonymousDisplayName, avatarSeed }
     │
     ▼
Frontend renders PostCard with anonymous name
```

### Mentor Replies to Post
```
Mentor (Browser)
     │
     ▼
POST /api/posts/:id/replies { body }
     │
     ▼
Auth Middleware → req.user { userId, role: MENTOR }
     │
     ▼
PostController.reply()
     │
     ▼
PostService.createReply()
     │
     ├── Verify mentor is verified (isVerifiedMentor)
     ├── Get mentor profile (name, department)
     ├── prisma.postReply.create({ anonymousIdentityId: mentorUserId, body })
     │   Note: Mentor uses their User.id as "identity" since mentors aren't anonymous
     │
     ▼
Return Reply with author: { name: "Dr. Smith", role: "MENTOR", isVerified: true, department }
     │
     ▼
Frontend renders Reply with "Verified Mentor" badge
```

### Student Starts Anonymous Chat (Auto Mentor Assignment)
```
Student (Browser)
     │
     ▼
POST /api/chats { }  (empty body = student-initiated)
     │
     ▼
ChatController.createThread()
     │
     ▼
ChatService.createThread()
     │
     ├── identityService.getAnonymousIdentity(studentUserId)
     ├── mentorAssignmentService.findAvailableMentor()
     │     └── Strategy: least active AVAILABLE mentor (by active chat count)
     ├── prisma.chatThread.create({ studentIdentityId, mentorId, status: ACTIVE })
     │
     ▼
Return ChatThread with mentor info (name, verified, department)
     │
     ▼
Frontend opens ChatWindow, connects Socket.io
     │
     ├── Socket: chat:join { threadId }
     ├── Server: verify JWT, authorize participant, join room
     │
     ▼
Real-time messaging via Socket.io events
```

### Meeting/Workshop Flow
```
Mentor creates Workshop
     │
     ▼
POST /api/workshops { title, date, time, meetingType, link/location, maxAttendees }
     │
     ▼
WorkshopService.create()
     │
     ├── req.user.role === MENTOR (verified)
     ├── prisma.workshop.create({ mentorId: req.user.userId, ... })
     │
     ▼
Student registers
     │
     ▼
POST /api/workshops/:id/register
     │
     ▼
WorkshopService.register()
     │
     ├── identityService.getAnonymousIdentity(studentUserId)
     ├── Check capacity (registrations < maxAttendees)
     ├── prisma.workshopRegistration.create({ workshopId, anonymousIdentityId })
     │
     ▼
Confirmation with registration status
```

### Resource Hub Access
```
GET /api/resources?category=EMERGENCY_CONTACTS
     │
     ▼
ResourceController.list()
     │
     ▼
ResourceService.getResources()
     │
     ├── prisma.resource.findMany({ where: { category, isActive: true } })
     │
     ▼
Return paginated resources (public content, no auth required for read)
```

---

## 8. Folder Responsibility

### `apps/web/src/`

| Directory | Responsibility |
|-----------|----------------|
| `pages/` | File-based routing; each `.astro` = page, `[param].astro` = dynamic route |
| `layouts/` | BaseLayout (HTML shell), StudentLayout (student nav), MentorLayout, AdminLayout |
| `components/` | Feature-organized reusable UI (auth/, posts/, chat/, meetings/, dashboard/, etc.) |
| `styles/` | Global CSS, Tailwind imports, Geist design tokens |
| `lib/` | `api.ts` (fetch wrapper with auth), `auth.ts` (token storage), `socket.ts` (Socket.io client) |
| `stores/` | Nanostores: `authStore.ts` (role, anonymousDisplayName), UI stores |
| `components/ui/` | Base design system components (Button, Input, Card, Badge, Modal) |

### `apps/api/src/`

| Directory | Responsibility |
|-----------|----------------|
| `config/` | `env.ts` — validated environment variables (Zod) |
| `routes/` | Route registration; thin, only maps HTTP method+path to controller |
| `controllers/` | Request/response handling; calls services, formats JSON, handles errors |
| `services/` | **Business logic lives here**; data access, cross-service coordination, transactions |
| `middlewares/` | `auth.middleware.ts`, `role.middleware.ts`, `validate.middleware.ts`, `error.middleware.ts`, `rateLimiter.middleware.ts` |
| `validators/` | Zod schemas per feature (auth.validator.ts, post.validator.ts, etc.) |
| `utils/` | `jwt.ts`, `hash.ts`, `logger.ts`, `ApiError.ts`, `anonymousIdentity.ts` |
| `sockets/` | `index.ts` (io setup, auth handshake), `chat.socket.ts`, `presence.socket.ts`, `notification.socket.ts` |
| `prisma/` | `client.ts` (singleton PrismaClient), `schema.prisma`, `seed.ts` |
| `types/` | `express.d.ts` — `declare module 'express' { interface Request { user: AuthUser } }` |

### `packages/shared-types/src/`

| File | Responsibility |
|------|----------------|
| `enums.ts` | All shared enums: Role, EmotionType, UrgencyLevel, MeetingType, MeetingHostType, ChatStatus, PostCategory, WorkshopCategory, ResourceCategory, MentorAvailabilityStatus |
| `entities.ts` | Shared DTO interfaces: ApiResponse, PaginatedResponse, JwtPayload, AuthUser, PostDTO, ChatThreadDTO, etc. |
| `index.ts` | Barrel export for clean imports |

### `docker/`

| File | Responsibility |
|------|----------------|
| `web.Dockerfile` | Multi-stage: install deps → build Astro → serve with preview |
| `api.Dockerfile` | Multi-stage: install deps → build TS → run compiled JS |
| `docker-compose.yml` | Local dev: web, api, postgres with health checks |

---

## 9. Technology Decisions

### Frontend: Astro + Tailwind + TypeScript

| Decision | Rationale |
|----------|-----------|
| **Astro** | Island architecture = minimal JS by default; perfect for content-heavy pages (landing, resources, dashboard SSR). TypeScript-first. Great DX. |
| **Tailwind CSS** | Utility-first matches Geist design tokens; rapid iteration; tree-shaken production CSS. |
| **TypeScript** | End-to-end type safety shared with backend via `packages/shared-types`. |
| **Nanostores** | Tiny (1KB), framework-agnostic state management for client islands (auth, UI). |
| **Socket.io Client** | Matches backend; auto-reconnection, rooms, typing events. |

### Backend: Express + Prisma + PostgreSQL

| Decision | Rationale |
|----------|-----------|
| **Express** | Minimal, unopinionated, massive ecosystem. Fits layered architecture (routes→controllers→services). TypeScript support excellent. |
| **Prisma ORM** | Type-safe database access; schema as source of truth; migrations; great DX with Prisma Studio. |
| **PostgreSQL** | Relational integrity critical for anonymous identity FKs; JSON support for flexible payloads; mature, reliable. |
| **JWT + bcrypt** | Stateless auth; bcrypt for password hashing (12 rounds); refresh token rotation for security. |
| **Zod** | Schema validation at runtime + TypeScript inference; used in validators and env config. |
| **Socket.io** | Real-time chat, presence, notifications; fallback transports; room-based architecture. |
| **Helmet + CORS** | Security headers, origin restriction. |
| **Pino/Winston** | Structured logging with redaction (no passwords/JWTs in logs). |

### Shared: pnpm Monorepo

| Decision | Rationale |
|----------|-----------|
| **pnpm Workspaces** | Fast, disk-efficient, strict dependency isolation. Native TypeScript project references. |
| **Shared Types Package** | Single source of truth for enums/DTOs; prevents drift between frontend/backend. |

### Infrastructure: Docker

| Decision | Rationale |
|----------|-----------|
| **Docker Compose** | Local dev mirrors production (web, api, db containers); health checks for startup order. |
| **Multi-stage Dockerfiles** | Small production images; no dev dependencies in final layer. |
| **PostgreSQL 16 Alpine** | Lightweight, reliable, matches production. |

### Design: Geist Design System

| Decision | Rationale |
|----------|-----------|
| **Geist (Vercel)** | Professional, accessible, minimal. Design tokens in `docs/design.md` map directly to Tailwind config. Light theme only for MVP. |

---

## 10. Future Scalability

### Horizontal Scaling
- **Stateless API**: Express servers share nothing; scale behind load balancer
- **Socket.io**: Redis adapter for multi-instance WebSocket broadcasting (Phase 14+)
- **Database**: Read replicas for analytics/dashboard queries; connection pooling via PgBouncer

### Database Optimization
- **Indexes**: Composite indexes on `(anonymousIdentityId, createdAt)`, `(status, createdAt)` for feeds
- **Partitioning**: `EmotionLog`, `ChatMessage`, `Notification` by month for high-volume tables
- **Materialized Views**: Mentor dashboard aggregations (emotion trends, priority feeds)

### Caching Strategy
- **Redis**: Session cache, rate limit counters, mentor presence, dashboard aggregates
- **CDN**: Static assets, Astro pre-rendered pages

### Feature Evolution
| Area | Future Enhancement |
|------|-------------------|
| Auth | SSO (SAML/OIDC) with university IdP; MFA for mentors/admins |
| Chat | Group peer circles; voice notes; crisis escalation button |
| AI | Content moderation; sentiment analysis; resource recommendation |
| Analytics | Cohort retention; mentor effectiveness; early warning indicators |
| Mobile | React Native / Expo wrapper with push notifications |

### Privacy Preservation at Scale
- **Zero-knowledge proofs** for mentor verification (prove credential without revealing identity)
- **Differential privacy** on aggregate emotion trends
- **Client-side encryption** for chat messages (optional E2EE)

---

## Appendix: Key Architectural Invariants

1. **AnonymousIdentity Isolation**: No feature table references `User.id` for student content. Enforced by schema + service layer.
2. **Auth Service Boundary**: Only `AuthService` and `IdentityService` may join `User ↔ AnonymousIdentity`.
3. **Mentor Transparency**: Mentors are not anonymous to the system; their verified identity is shown with badge.
4. **Audit Trail**: All admin mutations write `AdminActionLog`.
5. **Idempotency**: Registration, RSVP, workshop registration are idempotent (unique constraints).
6. **Soft Deletes**: Posts, replies, meetings use `isDeleted` / `status` flags, never hard delete.
7. **Validation at Edge**: Every route validates input via Zod middleware before controller.
8. **Error Shape Consistency**: All errors return `{ success: false, error: { code, message } }`.