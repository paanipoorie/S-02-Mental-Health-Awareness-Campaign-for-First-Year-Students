# Campus Anonymous Peer Support Platform — Architecture Documentation

## 1. Project Overview

### Purpose

The Campus Anonymous Peer Support Platform is a privacy-first mental health awareness and support platform designed specifically for first-year university students. It provides a safe, anonymous environment where students can share experiences, connect with verified mentors, access mental health resources, and participate in peer support activities — all without revealing their real identities.

### Target Users

- **Primary**: First-year university students experiencing transition stress, homesickness, academic pressure, loneliness, anxiety, or other mental health challenges.
- **Secondary**: Verified mentors (senior students, faculty advisors, trained peer supporters) who provide guidance and support.
- **Administrative**: Platform administrators who manage mentor verification, content moderation, and platform analytics.

### Core Goals

1. **Reduce stigma** around mental health by normalizing anonymous peer discussions.
2. **Increase awareness** of available campus mental health resources.
3. **Enable early intervention** through emotional status tracking and mentor prioritization.
4. **Build community** through anonymous posts, real-time chat, meetings, and workshops.
5. **Maintain absolute privacy** — student identities are never exposed to peers or mentors.

### Privacy-First Philosophy

- **Zero identity exposure**: Student real identities (email, name, ID) are never visible to other students or mentors.
- **Anonymous identity layer**: Every student receives a persistent, human-readable anonymous identity (e.g., "Anonymous Calm Sparrow") used across all platform features.
- **Strict database separation**: Feature tables reference `AnonymousIdentity.id`, never `User.id` for student-generated content.
- **Service-layer enforcement**: Auth service is the only component allowed to query or resolve `AnonymousIdentity ↔ User` relationships.
- **Audit logging**: All admin actions are logged for accountability.

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
│  │  └──────────┘ └──────────────┘ └─────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Emotion  │ │  Mentor      │ │ Resource│ │ Admin    │ │ Notification │  │
│  │   Log    │ │  Profile     │ │         │ │ Action   │ │              │  │
│  └──────────┘ └──────────────┘ └─────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Interactions

| Component           | Role                                            | Interactions                                                             |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| **Astro Frontend**  | SSR/SSG rendered pages with interactive islands | REST calls to Express API, WebSocket to Socket.io for real-time features |
| **Express Backend** | REST API, business logic, auth, validation      | Prisma ORM for DB, Socket.io for real-time, JWT for auth                 |
| **PostgreSQL**      | Primary persistent storage                      | Prisma ORM manages schema, migrations, queries                           |
| **Prisma**          | Type-safe database access                       | Schema-defined models, migrations, type generation                       |
| **Socket.io**       | Real-time bidirectional communication           | Auth via JWT handshake, rooms for chat threads, presence broadcasting    |
| **Docker**          | Container orchestration                         | Multi-service deployment (web, api, postgres) with health checks         |

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
│       │   ├── services/       # Business logic, data access, cross-service calls
│       │   ├── middlewares/    # Auth, RBAC, validation, error handling, rate limiting
│       │   ├── validators/     # Zod schemas for request validation
│       │   ├── utils/          # Helpers (jwt, hash, anonymousIdentity)
│       │   ├── sockets/        # Socket.io setup, event handlers
│       │   ├── prisma/         # Prisma client configuration
│       │   ├── types/          # Express request augmentation (express.d.ts)
│       │   ├── app.ts          # Express app factory
│       │   └── server.ts       # Entry point, server startup
│       ├── prisma/
│       │   ├── schema.prisma   # Database schema
│       │   └── seed.ts         # Seeding script
│       └── tsconfig.json
│
├── packages/
│   └── shared-types/           # Shared TypeScript types & enums
│       ├── src/
│       │   ├── enums.ts        # Role, EmotionType, UrgencyLevel, etc.
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

---

## 4. Request Flow

### REST API Request Lifecycle

The lifecycle of an API request traverses the frontend client, the backend routing, validation, middleware stack, and the service layer down to the database before resolving.

```
Client (Browser / Astro)
      │
      │ fetch() with JWT in Authorization header / httpOnly cookie
      ▼
Express Router (api/src/routes/)
      │ Route match established (e.g. POST /api/auth/login)
      ▼
Rate Limiter Middleware (api/src/middlewares/rateLimiter.middleware.ts)
      │ Rejects request with 429 if rate limit threshold exceeded
      ▼
Validation Middleware (api/src/middlewares/validate.middleware.ts)
      │ Validates payload schemas (zod-based validators)
      ▼
Authentication Middleware (api/src/middlewares/auth.middleware.ts)
      │ Verifies JWT access token; attaches decoded user to req.user
      ▼
Authorization Middleware (api/src/middlewares/auth.middleware.ts)
      │ Guards routes via requireRole() or requireVerifiedMentor() (queries DB)
      ▼
Controller Layer (api/src/controllers/)
      │ Maps request payload to service inputs; Thin controller
      ▼
Service Layer (api/src/services/)
      │ Domain & Business logic; Database transaction boundaries
      ▼
Prisma ORM (api/src/prisma/client.ts)
      │ Prepares & executes type-safe queries
      ▼
PostgreSQL Database
      │ Persists or retrieves records
      ▼
Service returns data to Controller
      ▼
Controller sends standardized response JSON
      │ Format: { success: true, data: ... }
      ▼
Error Middleware (api/src/app.ts)
      │ Catches errors and formats consistent JSON: { success: false, error: ... }
      ▼
JSON Response received by Client
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

---

## 5. Authentication Architecture

Authentication is stateless and uses JSON Web Tokens (JWT) for secure session tracking. It enforces domain verification to restrict registration to university members.

```
                  ┌─────────────────────────────────────┐
                  │          Register / Login           │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │ Verify university.edu Email Domain  │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │   Bcrypt Hash (12 rounds) Verify    │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                ┌────────────────────┴────────────────────┐
                ▼                                         ▼
      Role === STUDENT?                         Role === MENTOR/ADMIN?
  ┌─────────────┴─────────────┐             ┌─────────────┴─────────────┐
  │ Create User               │             │ Create User               │
  │ Auto-create Anon Identity │             │ No Anonymous Identity     │
  └─────────────┬─────────────┘             └─────────────┬─────────────┘
                │                                         │
                └────────────────────┬────────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │  Generate Access & Refresh Tokens   │
                  └─────────────────────────────────────┘
```

### Access Token Lifecycle

- **Scope**: Short-lived access credential containing `userId`, `role`, and `email` payload.
- **Expiration**: 15 minutes.
- **Storage**: In-memory on client side (to prevent XSS leakage). Sent as `Bearer <token>` inside the `Authorization` header.

### Refresh Token Lifecycle

- **Scope**: Long-lived credential used strictly to obtain new access tokens without requiring re-authentication.
- **Expiration**: 7 days.
- **Storage**: Stored in a secure, `httpOnly`, `sameSite: 'lax'` cookie (with `secure: true` in production) to prevent CSRF and script access.
- **Rotation**: Validated, rotated upon reuse check, and cleared upon logout.

### Middleware Flow

1. **authMiddleware**: Resolves the authorization token from the request header or cookie. Decodes the token, handles expired/malformed states, and attaches user info to `req.user`.
2. **requireRole**: Ensures only specific roles (e.g. `STUDENT`, `ADMIN`) are permitted to access endpoint targets.
3. **requireVerifiedMentor**: Restricts access to mentors whose profiles have been vetted and validated in the database (`isVerifiedMentor === true`).

---

## 6. Anonymous Identity Architecture

### Design Philosophy

Students seeking support face severe psychological barriers. To eliminate fear of academic exposure or social stigma, the platform establishes **Absolute Anonymity** for students. Real student identities are strictly separated from feature layers.

### Identity Isolation

1. **Model Decoupling**: All student activities (writing posts, posting replies, messaging, logging emotions, registering for workshops) reference an `AnonymousIdentity.id` field. They _never_ reference a `User.id` directly.
2. **Data-Store Separation**: Only the auth/identity services can query the 1:1 relationship between `User` and `AnonymousIdentity` (e.g. when fetching profile details via `GET /api/auth/me`).
3. **Stateless JWTs**: While the client session maintains a cryptographically signed JWT containing `userId` and `email`, these identifiers are processed server-side only and are never echoed back in student responses.

### Mentors vs. Students

- **Students**: Remain strictly anonymous to prevent peer-to-peer or peer-to-mentor profiling. They operate under their generated display names (e.g., "Anonymous Calm Sparrow") and random avatar seeds.
- **Mentors & Admins**: Do _not_ have anonymous identities. Their contributions carry verified badges (e.g., "Verified Mentor") along with their professional credentials (real name, department) to build platform trust, safety, and legitimacy.

### Privacy Guarantees

- Student emails and real database IDs are never leaked to external client payloads.
- Anonymized names are generated using a unique word-bank algorithm combinatorics, ensuring student profiles remain persistent but untraceable to their LDAP accounts.

---

## 7. Database Architecture

The database is built on PostgreSQL, using Prisma ORM to manage schema migrations and model relationships. The tables are partitioned into Identity, Content, Communication, Events, and Administrative blocks.

### Database Schema Models

#### 1. User

Stores core credentials and access roles.

- `id` (String, PK, cuid)
- `universityEmail` (String, Unique)
- `passwordHash` (String)
- `role` (Role enum: STUDENT, MENTOR, ADMIN)
- `isVerifiedMentor` (Boolean)
- `isActive` (Boolean)
- `createdAt` (DateTime)

#### 2. AnonymousIdentity

Provides student anonymity. Linked 1:1 with User.

- `id` (String, PK, cuid)
- `userId` (String, FK User, Unique)
- `displayName` (String, Unique)
- `avatarSeed` (Int)
- `createdAt` (DateTime)

#### 3. MentorProfile

Stores details of verified campus mentors.

- `id` (String, PK, cuid)
- `userId` (String, FK User, Unique)
- `department` (String)
- `bio` (String)
- `specialties` (String[])
- `availabilityStatus` (MentorAvailabilityStatus enum)
- `lastSeenAt` (DateTime, Nullable)

#### 4. EmotionLog

Tracks student emotional logs for dashboard visualization and prioritization.

- `id` (String, PK, cuid)
- `anonymousIdentityId` (String, FK AnonymousIdentity)
- `emotion` (EmotionType enum)
- `urgencyLevel` (UrgencyLevel enum, Nullable)
- `context` (EmotionContext enum)
- `createdAt` (DateTime)

#### 5. Post

Handles student forum posts.

- `id` (String, PK, cuid)
- `anonymousIdentityId` (String, FK AnonymousIdentity)
- `title` (String)
- `body` (String)
- `category` (PostCategory enum)
- `emotion` (EmotionType enum, Nullable)
- `urgencyLevel` (UrgencyLevel enum, Nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `isDeleted` (Boolean)

#### 6. PostReply

Stores forum replies.

- `id` (String, PK, cuid)
- `postId` (String, FK Post)
- `anonymousIdentityId` (String) - Can be AnonymousIdentity.id (student) or User.id (mentor)
- `body` (String)
- `createdAt` (DateTime)
- `isDeleted` (Boolean)

#### 7. ChatThread

Connects a student and a mentor in a private channel.

- `id` (String, PK, cuid)
- `studentIdentityId` (String, FK AnonymousIdentity)
- `mentorId` (String, FK User, Nullable)
- `status` (ChatStatus enum: ACTIVE, CLOSED)
- `createdAt` (DateTime)

#### 8. ChatMessage

Individual chat messages.

- `id` (String, PK, cuid)
- `chatThreadId` (String, FK ChatThread)
- `senderType` (String) - Polymorphic: 'ANONYMOUS_IDENTITY' or 'MENTOR'
- `senderId` (String) - Resolves to AnonymousIdentity.id or User.id
- `body` (String)
- `createdAt` (DateTime)
- `readAt` (DateTime, Nullable)

#### 9. Meeting

Group sessions or office hours hosted by mentors or students.

- `id` (String, PK, cuid)
- `title` (String)
- `description` (String)
- `hostType` (MeetingHostType enum: STUDENT, MENTOR)
- `hostIdentityId` (String, FK AnonymousIdentity, Nullable)
- `hostUserId` (String, FK User, Nullable)
- `date` (DateTime)
- `time` (String)
- `durationMinutes` (Int)
- `meetingType` (MeetingType enum: ONLINE, OFFLINE)
- `meetingLink` (String, Nullable)
- `location` (String, Nullable)
- `category` (MeetingCategory enum)
- `createdAt` (DateTime)

#### 10. MeetingAttendee

Tracks meeting signups.

- `id` (String, PK, cuid)
- `meetingId` (String, FK Meeting)
- `anonymousIdentityId` (String, FK AnonymousIdentity)
- `joinedAt` (DateTime)

#### 11. Workshop

Mentor-led educational webinars.

- `id` (String, PK, cuid)
- `title` (String)
- `description` (String)
- `mentorId` (String, FK User)
- `date` (DateTime)
- `time` (String)
- `durationMinutes` (Int)
- `meetingType` (MeetingType enum)
- `meetingLink` (String, Nullable)
- `location` (String, Nullable)
- `category` (WorkshopCategory enum)
- `maxAttendees` (Int, Nullable)
- `resources` (String, Nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

#### 12. WorkshopRegistration

Student registrations for mentor workshops.

- `id` (String, PK, cuid)
- `workshopId` (String, FK Workshop)
- `anonymousIdentityId` (String, FK AnonymousIdentity)
- `status` (WorkshopRegistrationStatus enum: REGISTERED, ATTENDED, CANCELLED)
- `registeredAt` (DateTime)
- `attendedAt` (DateTime, Nullable)

#### 13. Resource

Publicly accessible self-help materials or contact hubs.

- `id` (String, PK, cuid)
- `title` (String)
- `description` (String)
- `category` (ResourceCategory enum)
- `content` (String)
- `link` (String, Nullable)
- `isActive` (Boolean)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

#### 14. AdminActionLog

Secures audit logging for administrative adjustments.

- `id` (String, PK, cuid)
- `adminUserId` (String, FK User)
- `actionType` (String)
- `targetType` (String)
- `targetId` (String)
- `notes` (String, Nullable)
- `createdAt` (DateTime)

---

## 8. Folder Responsibility

### `apps/web/src/`

| Directory        | Responsibility                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `pages/`         | File-based routing; each `.astro` = page, `[param].astro` = dynamic route                     |
| `layouts/`       | BaseLayout (HTML shell), StudentLayout (student nav), MentorLayout, AdminLayout               |
| `components/`    | Feature-organized reusable UI (auth/, posts/, chat/, meetings/, dashboard/, etc.)             |
| `styles/`        | Global CSS, Tailwind imports, Geist design tokens                                             |
| `lib/`           | `api.ts` (fetch wrapper with auth), `auth.ts` (token storage), `socket.ts` (Socket.io client) |
| `stores/`        | Nanostores: `authStore.ts` (role, anonymousDisplayName), UI stores                            |
| `components/ui/` | Base design system components (Button, Input, Card, Badge, Modal)                             |

### `apps/api/src/`

| Directory      | Responsibility                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `config/`      | `env.ts` — validated environment variables (Zod)                                                        |
| `routes/`      | Route registration; thin, only maps HTTP method+path to controller                                      |
| `controllers/` | Request/response handling; calls services, formats JSON, handles errors                                 |
| `services/`    | **Business logic lives here**; data access, cross-service coordination, transactions                    |
| `middlewares/` | `auth.middleware.ts`, `rateLimiter.middleware.ts`, `validate.middleware.ts`                             |
| `validators/`  | Zod schemas per feature (auth.validator.ts)                                                             |
| `utils/`       | `jwt.ts`, `hash.ts`, `anonymousIdentity.ts`                                                             |
| `sockets/`     | `index.ts` (io setup, auth handshake), `chat.socket.ts`, `presence.socket.ts`, `notification.socket.ts` |
| `prisma/`      | `client.ts` (singleton PrismaClient)                                                                    |
| `types/`       | `express.d.ts` — Express request augmentation (`Request.user`)                                          |

### `packages/shared-types/src/`

| File          | Responsibility                                                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enums.ts`    | All shared enums: Role, EmotionType, UrgencyLevel, MeetingType, MeetingHostType, ChatStatus, PostCategory, WorkshopCategory, ResourceCategory, MentorAvailabilityStatus |
| `entities.ts` | Shared DTO interfaces: ApiResponse, PaginatedResponse, JwtPayload, AuthUser, PostDTO, ChatThreadDTO, etc.                                                               |
| `index.ts`    | Barrel export for clean imports                                                                                                                                         |

### `docker/`

| File                 | Responsibility                                               |
| -------------------- | ------------------------------------------------------------ |
| `web.Dockerfile`     | Multi-stage: install deps → build Astro → serve with preview |
| `api.Dockerfile`     | Multi-stage: install deps → build TS → run compiled JS       |
| `docker-compose.yml` | Local dev: web, api, postgres with health checks             |

---

## 9. Technology Decisions

### Frontend: Astro + Tailwind + TypeScript

| Decision             | Rationale                                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Astro**            | Island architecture = minimal JS by default; perfect for content-heavy pages (landing, resources, dashboard SSR). TypeScript-first. Great DX. |
| **Tailwind CSS**     | Utility-first matches Geist design tokens; rapid iteration; tree-shaken production CSS.                                                       |
| **TypeScript**       | End-to-end type safety shared with backend via `packages/shared-types`.                                                                       |
| **Nanostores**       | Tiny (1KB), framework-agnostic state management for client islands (auth, UI).                                                                |
| **Socket.io Client** | Matches backend; auto-reconnection, rooms, typing events.                                                                                     |

### Backend: Express + Prisma + PostgreSQL

| Decision          | Rationale                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Express**       | Minimal, unopinionated, massive ecosystem. Fits layered architecture (routes→controllers→services). TypeScript support excellent. |
| **Prisma ORM**    | Type-safe database access; schema as source of truth; migrations; great DX with Prisma Studio.                                    |
| **PostgreSQL**    | Relational integrity critical for anonymous identity FKs; JSON support for flexible payloads; mature, reliable.                   |
| **JWT + bcrypt**  | Stateless auth; bcrypt for password hashing (12 rounds); refresh token rotation for security.                                     |
| **Zod**           | Schema validation at runtime + TypeScript inference; used in validators and env config.                                           |
| **Socket.io**     | Real-time chat, presence, notifications; fallback transports; room-based architecture.                                            |
| **Helmet + CORS** | Security headers, origin restriction.                                                                                             |

### Shared: pnpm Monorepo

| Decision                 | Rationale                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **pnpm Workspaces**      | Fast, disk-efficient, strict dependency isolation. Native TypeScript project references. |
| **Shared Types Package** | Single source of truth for enums/DTOs; prevents drift between frontend/backend.          |

### Infrastructure: Docker

| Decision                    | Rationale                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| **Docker Compose**          | Local dev mirrors production (web, api, db containers); health checks for startup order. |
| **Multi-stage Dockerfiles** | Small production images; no dev dependencies in final layer.                             |
| **PostgreSQL 16 Alpine**    | Lightweight, reliable, matches production.                                               |

### Design: Geist Design System

| Decision           | Rationale                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Geist (Vercel)** | Professional, accessible, minimal. Design tokens in `docs/design.md` map directly to Tailwind config. Light theme only for MVP. |

---

## 10. Future Scalability

### Horizontal Scaling

- **Stateless API**: Express servers share nothing; scale behind load balancer.
- **Socket.io**: Redis adapter for multi-instance WebSocket broadcasting (Phase 14+).
- **Database**: Read replicas for analytics/dashboard queries; connection pooling via PgBouncer.

### Database Optimization

- **Indexes**: Composite indexes on `(anonymousIdentityId, createdAt)`, `(status, createdAt)` for feeds.
- **Partitioning**: `EmotionLog`, `ChatMessage`, `Notification` by month for high-volume tables.
- **Materialized Views**: Mentor dashboard aggregations (emotion trends, priority feeds).

### Caching Strategy

- **Redis**: Session cache, rate limit counters, mentor presence, dashboard aggregates.
- **CDN**: Static assets, Astro pre-rendered pages.

### Feature Evolution

| Area      | Future Enhancement                                               |
| --------- | ---------------------------------------------------------------- |
| Auth      | SSO (SAML/OIDC) with university IdP; MFA for mentors/admins      |
| Chat      | Group peer circles; voice notes; crisis escalation button        |
| AI        | Content moderation; sentiment analysis; resource recommendation  |
| Analytics | Cohort retention; mentor effectiveness; early warning indicators |
| Mobile    | React Native / Expo wrapper with push notifications              |

### Privacy Preservation at Scale

- **Zero-knowledge proofs** for mentor verification (prove credential without revealing identity).
- **Differential privacy** on aggregate emotion trends.
- **Client-side encryption** for chat messages (optional E2EE).

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
