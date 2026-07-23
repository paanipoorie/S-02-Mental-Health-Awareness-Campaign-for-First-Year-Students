# Campus Anonymous Peer Support Platform — Development Roadmap

**Architect's Note:** This roadmap is written so that each phase is a self-contained unit of work. An implementing agent should be able to open a single phase, read it top to bottom, and build exactly that slice without needing to guess what comes before or after. Phases are ordered so that every dependency (schema, auth, RBAC) exists before the feature that needs it is built. No implementation code is included — only structure, contracts, and acceptance criteria.

**Stack recap:** Astro + Tailwind + TypeScript (frontend) · Node.js + Express + PostgreSQL + Prisma (backend) · JWT + bcrypt (auth) · Socket.io (realtime) · Docker (deployment) · Git (version control).

**Repository shape:** Monorepo with two top-level apps: `apps/web` (Astro) and `apps/api` (Express), plus a shared `packages/` directory for types/constants used by both.

---

## Phase 0 — Project Initialization & Monorepo Setup ✅ COMPLETED

### Goal
Stand up an empty but fully wired skeleton: both apps run, talk to a database, lint/format cleanly, and are containerized. No feature logic yet.

### Features
- Monorepo scaffolding
- Astro frontend skeleton
- Express backend skeleton
- TypeScript configured on both sides
- ESLint + Prettier shared config
- TailwindCSS wired into Astro
- Git initialized with proper `.gitignore`
- PostgreSQL running via Docker
- Prisma initialized and connected
- Environment variable convention established
- Docker Compose for local dev (web, api, db)

### Folder/File Additions
```
/ (repo root)
├── apps/
│   ├── web/                        # Astro app
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   └── index.astro
│   │   │   ├── layouts/
│   │   │   ├── components/
│   │   │   ├── styles/
│   │   │   │   └── globals.css
│   │   │   └── env.d.ts
│   │   ├── public/
│   │   ├── astro.config.mjs
│   │   ├── tailwind.config.cjs
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── .env.example
│   └── api/                        # Express app
│       ├── src/
│       │   ├── config/
│       │   │   └── env.ts
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── middlewares/
│       │   ├── utils/
│       │   ├── sockets/
│       │   ├── prisma/
│       │   │   ├── schema.prisma
│       │   │   └── seed.ts
│       │   ├── app.ts
│       │   └── server.ts
│       ├── tsconfig.json
│       ├── package.json
│       └── .env.example
├── packages/
│   └── shared-types/               # shared TS types/enums (e.g. Role, EmotionType)
│       ├── src/index.ts
│       └── package.json
├── docker/
│   ├── web.Dockerfile
│   ├── api.Dockerfile
│   └── docker-compose.yml
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── package.json                    # workspace root (npm/pnpm workspaces)
└── README.md
```

### APIs to Build
- `GET /api/health` — returns `{ status: "ok", db: "connected" }`. This is the only endpoint in this phase; its sole purpose is to prove the API boots and can reach PostgreSQL.

### Database Tables
None yet. Prisma is initialized with an empty `schema.prisma` (datasource + generator blocks only) and a successful `prisma migrate dev` against an empty schema to prove connectivity.

### Frontend Pages
- `index.astro` — placeholder landing page confirming Tailwind styles apply (e.g., a styled "Coming Soon" card).

### Components
None yet (no design system exists until Phase 1's shared layout work).

### Acceptance Criteria
- [ ] `npm run dev` (or workspace equivalent) starts both `apps/web` and `apps/api` concurrently without errors.
- [ ] `GET /api/health` returns 200 with DB connection confirmed.
- [ ] Astro page renders with Tailwind classes visibly applied.
- [ ] `docker compose up` boots `web`, `api`, and `postgres` containers successfully and health check passes inside Docker network.
- [ ] ESLint and Prettier run cleanly with zero errors on a fresh checkout (`npm run lint`, `npm run format:check`).
- [ ] `.env.example` exists for both apps listing every required variable with placeholder values; real `.env` files are gitignored.
- [ ] `git log` shows an initial commit and this phase's commit; repo has a working `.gitignore` (node_modules, .env, dist, .astro, etc.).

### Git Commit Message
```
chore(init): scaffold monorepo with Astro, Express, Prisma, Docker and tooling
```

---

## Phase 1 — Core Database Schema & Domain Modeling ✅ COMPLETED

### Goal
Design and migrate the full baseline data model for the entire MVP up front, even though most features aren't built yet. Doing this in one pass avoids painful migrations later and lets every subsequent phase just consume existing tables.

### Features
- Complete Prisma schema for all core entities
- Enum definitions (Role, EmotionType, MeetingType, MeetingHostType, ChatStatus)
- Seed script with dummy data for local development
- Anonymous identity generation strategy defined (word-pair generator: adjective/noun banks, e.g. "Anonymous Sparrow")

### Folder/File Additions
```
apps/api/src/prisma/
├── schema.prisma          # full schema (see tables below)
├── seed.ts                # seeds an admin, 2 mentors, 3 students, sample posts
└── migrations/            # generated by prisma migrate
apps/api/src/utils/
└── anonymousIdentity.ts   # word banks + generator (design only, no route yet)
packages/shared-types/src/
├── enums.ts                # Role, EmotionType, UrgencyLevel, MeetingType, MeetingHostType, ChatStatus, PostCategory, WorkshopCategory, ResourceCategory, MentorAvailabilityStatus
└── entities.ts              # shared DTO interfaces
```

### APIs to Build
None — this phase is schema-only. (No routes are exposed yet; the goal is a migrated, seedable database.)

### Database Tables
- **User** — id, universityEmail (unique, hashed or plain per privacy design — see Phase 2), passwordHash, role (STUDENT | MENTOR | ADMIN), isVerifiedMentor (bool), createdAt, isActive
- **AnonymousIdentity** — id, userId (1:1 with User), displayName ("Anonymous Sparrow"), avatarSeed, createdAt — this is the *only* table any other feature table should ever reference for "who posted this," never `User` directly
- **EmotionLog** — id, anonymousIdentityId, emotion (enum), urgencyLevel (LOW | MEDIUM | HIGH, nullable), context (POST | CHAT | STANDALONE), createdAt
- **Post** — id, anonymousIdentityId, title, body, category (enum: ACADEMICS | HOSTEL | HOMESICKNESS | FRIENDS | RELATIONSHIPS | TIME_MANAGEMENT | EXAMS | SLEEP | CLUBS | FINANCIAL | GENERAL), emotion (nullable enum snapshot), urgencyLevel (nullable enum), createdAt, updatedAt, isDeleted
- **PostReply** — id, postId, anonymousIdentityId, body, createdAt, isDeleted
- **ChatThread** — id, studentIdentityId, mentorId (references User directly since mentor identity is not anonymous to itself, but see Phase 6 for exposure rules), status (ACTIVE | CLOSED), createdAt
- **ChatMessage** — id, chatThreadId, senderIdentityId (polymorphic: could be anonymous identity or mentor userId — modeled via senderType + senderId), body, createdAt, readAt
- **Meeting** — id, title, description, hostType (STUDENT | MENTOR), hostIdentityId (nullable, for student hosts), hostUserId (nullable, for mentor hosts), date, time, durationMinutes, meetingType (ONLINE | OFFLINE), meetingLink (nullable, for online), location (nullable, for offline), category, createdAt
- **MeetingAttendee** — id, meetingId, anonymousIdentityId, joinedAt
- **Workshop** — id, title, description, mentorId (references User), date, time, durationMinutes, meetingType (ONLINE | OFFLINE), meetingLink (nullable, for online), location (nullable, for offline), category, maxAttendees (nullable), resources (text/JSON for post-workshop materials), createdAt, updatedAt
- **WorkshopRegistration** — id, workshopId, anonymousIdentityId, status (REGISTERED | ATTENDED | CANCELLED), registeredAt, attendedAt
- **MentorProfile** — id, userId (1:1), department, bio, specialties (string[]), availabilityStatus (AVAILABLE | BUSY | OFFLINE), lastSeenAt
- **Resource** — id, title, description, category (COUNSELING_CENTER | EMERGENCY_CONTACTS | FACULTY_ADVISORS | STUDENT_WELFARE | CAMPUS_CLUBS | SELF_HELP_PDFS | STRESS_MANAGEMENT | SLEEP_HYGIENE | EXTERNAL_HELPLINES), content (text/JSON), link (nullable, for external resources), isActive (bool), createdAt, updatedAt
- **AdminActionLog** — id, adminUserId, actionType, targetType, targetId, notes, createdAt

> **Design principle carried through every later phase:** feature tables reference `AnonymousIdentity.id`, never `User.id`, for anything a student produces. Only the auth service is ever allowed to join `AnonymousIdentity → User`. This is enforced later in Phase 2 at the service-layer boundary.

### Frontend Pages
None.

### Components
None.

### Acceptance Criteria
- [ ] `prisma migrate dev` runs cleanly and produces all tables listed above with correct foreign keys and enums.
- [ ] `prisma studio` (or equivalent inspection) shows correct relations: User↔AnonymousIdentity (1:1), AnonymousIdentity↔Post (1:many), etc.
- [ ] Seed script populates: 1 admin, 2 mentors (with MentorProfile), 3 students (each with an AnonymousIdentity), a few posts/replies, one meeting, one workshop, and sample resources — running `npm run seed` twice does not error (idempotent or resettable).
- [ ] `anonymousIdentity.ts` generator produces non-repeating, human-readable names from static word banks (documented in file, no external API calls).
- [ ] Shared enums in `packages/shared-types` are imported by `schema.prisma` naming conventions (kept in sync manually and documented) so frontend and backend agree on string values (e.g. `"HOMESICKNESS"` not `"Homesick"`).
- [ ] Schema and this document's table list match 1:1 — no undocumented tables, no missing ones.

### Git Commit Message
```
feat(db): define full Prisma schema for users, anonymous identities, posts, chats, meetings and mentors
```

---

## Phase 2 — Authentication & Anonymous Identity System ✅ COMPLETED

### Sub-phase 2.1 — Core Authentication Utilities

Goal:
Build the authentication foundation only.

Scope:
- JWT utilities
- Password hashing (bcrypt)
- JWT configuration in env
- Utility functions only

Do NOT implement middleware or services yet.

Folder/File Additions:
```
apps/api/src/
├── utils/hash.ts                    # bcrypt wrappers
└── utils/jwt.ts                     # sign/verify wrappers
```

Database Tables:
No new tables — consumes `User` and `AnonymousIdentity` from Phase 1.

Acceptance Criteria:
- [ ] Password hashing utility correctly hashes passwords and verifies them using bcrypt.
- [ ] JWT utilities correctly sign and verify tokens, loading secret and expiry from environment variables.
- [ ] Verification fails appropriately for expired or malformed tokens.

Suggested commit:
feat(auth): add JWT and password utilities

---

### Sub-phase 2.2 — Authentication Middleware & Validation

Goal:
Implement request-level authentication infrastructure.

Scope:
- Auth middleware
- Rate limiter middleware
- Zod validators
- Request typing
- Shared auth helpers

Folder/File Additions:
```
apps/api/src/
├── middlewares/auth.middleware.ts   # verifies JWT, attaches req.user
├── middlewares/rateLimiter.middleware.ts
├── validators/auth.validator.ts     # zod schemas for register/login payloads
└── types/express.d.ts                # augments Request with req.user
```

Database Tables:
No new tables.

Acceptance Criteria:
- [ ] Authentication middleware validates incoming JWT from headers/cookies and attaches the decoded payload to the Express Request object (`req.user`).
- [ ] Unauthorized requests (missing or invalid tokens) are blocked with a 401 response status.
- [ ] Zod validators correctly validate request body schemas for registration and login payloads, returning structured validation errors.
- [ ] Rate limiting middleware successfully intercepts requests based on pre-defined limits.

Suggested commit:
feat(auth): add authentication middleware and validation

---

### Sub-phase 2.3 — Authentication & Identity Services

Goal:
Implement the complete business logic layer.

Scope:
- Auth service
- Identity service
- Registration logic
- Login logic
- Refresh token logic
- Logout logic
- Anonymous identity creation
- Service-layer tests if applicable

Do NOT expose HTTP endpoints yet.

Folder/File Additions:
```
apps/api/src/
├── services/auth.service.ts         # Handles registration, login, logout, and token logic
└── services/identity.service.ts     # Owns AnonymousIdentity creation/lookup logic
```

Database Tables:
No new tables.

Acceptance Criteria:
- [ ] Registration service logic correctly checks for university email domains, registers users, hashes passwords, and auto-generates exactly one `AnonymousIdentity` for `STUDENT` users.
- [ ] Login service logic validates credentials and returns appropriate token pair.
- [ ] Anonymous identity service prevents de-anonymization: it ensures user details are completely isolated from their anonymous profile.
- [ ] Service methods successfully handle edge cases (e.g. email conflicts, invalid passwords).

Suggested commit:
feat(auth): implement authentication and identity services

---

### Sub-phase 2.4 — Authentication REST API

Goal:
Expose the authentication APIs.

Scope:
- Auth controller
- Auth routes
- Route registration
- Error handling
- Register
- Login
- Logout
- Refresh
- Me endpoint

Folder/File Additions:
```
apps/api/src/
├── routes/auth.routes.ts
└── controllers/auth.controller.ts
```

Database Tables:
No new tables.

APIs to Build:
- `POST /api/auth/register` — body: `{ universityEmail, password, role? }`. Validates domain, hashes password, creates User, and if role=STUDENT auto-creates AnonymousIdentity.
- `POST /api/auth/login` — body: `{ universityEmail, password }`. Returns JWT + role. For students, does **not** return the anonymous name in the login payload directly tied to email.
- `POST /api/auth/logout` — clears refresh token/cookie.
- `GET /api/auth/me` — returns role-appropriate profile: for a student, `{ role, anonymousDisplayName, avatarSeed }`; for a mentor, `{ role, name, isVerifiedMentor, department }`.
- `POST /api/auth/refresh` — rotates access token using refresh token.

Acceptance Criteria:
- [ ] Auth endpoints are wired to the express router under `/api/auth`.
- [ ] Endpoints respond with correct status codes (e.g. 201 for register, 200 for login, 400 for validation failure).
- [ ] `/api/auth/me` never leaks private user details like email or real userId to student clients.

Suggested commit:
feat(auth): implement authentication API endpoints

---

### Sub-phase 2.5 — Authentication Verification

Goal:
Verify the complete authentication flow.

Scope:
- Integration tests
- Authentication flow verification
- Anonymous identity verification
- Rate limiter verification
- API validation
- End-to-end auth flow

Folder/File Additions:
```
apps/api/src/__tests__/auth.test.ts   # integration tests
```

Acceptance Criteria:
- [ ] Integration tests verify the end-to-end auth flow (Register -> Login -> Fetch Me -> Refresh -> Logout).
- [ ] Identity test cases explicitly assert that student emails or real database IDs are never leaked to external client payloads.
- [ ] Rate limiting is verified to block client requests after consecutive authentication failures.
- [ ] All verification test suites execute and pass successfully.

Suggested commit:
test(auth): verify authentication and anonymity flow

---

## Phase 3 — Role-Based Access Control (RBAC) & App Shell ✅ COMPLETED

### Goal
Establish reusable authorization middleware and the shared frontend shell (nav, layout, protected routing, and authentication interface) that every subsequent feature phase will plug into. No new user-facing features yet — this is the "wiring" phase that prevents every later phase from re-solving authorization and session validation from scratch.

### Features
- `requireRole(...)` middleware for Express routes
- `requireVerifiedMentor` middleware (mentor-only + must have `isVerifiedMentor=true`)
- Centralized error-handling middleware with consistent JSON error shape
- Request validation middleware pattern (wraps zod/joi schemas)
- Centralized logger (e.g. pino/winston) with request logging
- Shared Astro layout with role-aware navbar (renders different links for student/mentor/admin)
- Global frontend auth context (Astro + a lightweight client store, e.g. nanostores)
- Frontend authentication pages (login, register) and components (LoginForm, RegisterForm)
- Frontend API fetch client and authentication/token storage helpers
- AuthGuard wrapper/util for protected routing

### Folder/File Additions
```
apps/api/src/
├── middlewares/
│   ├── role.middleware.ts          # requireRole(['STUDENT']), requireVerifiedMentor
│   ├── error.middleware.ts         # centralized error handler
│   └── validate.middleware.ts      # generic schema-validation wrapper
├── utils/
│   ├── logger.ts
│   └── ApiError.ts                 # custom error class (statusCode, message, code)
└── types/
    └── express.d.ts                # augments Request with req.user

apps/web/src/
├── layouts/
│   ├── BaseLayout.astro
│   ├── StudentLayout.astro
│   └── MentorLayout.astro
├── pages/
│   ├── login.astro
│   └── register.astro
├── components/auth/
│   ├── LoginForm.tsx (or .astro + client script)
│   └── RegisterForm.tsx
├── components/nav/
│   ├── Navbar.astro
│   └── RoleBadge.astro             # e.g. "Verified Mentor" badge
├── lib/
│   ├── api.ts                       # fetch wrapper attaching JWT
│   └── auth.ts                      # token storage helpers (httpOnly cookie preferred)
└── stores/
    └── authStore.ts                # nanostores: current role, anonymousDisplayName
```

### APIs to Build
None new — this phase hardens the request pipeline all existing and future APIs run through (error handler, validators, RBAC guards applied retroactively to Phase 2 routes where relevant, e.g. admin-only routes reserved for Phase 10).

### Database Tables
None new.

### Frontend Pages
- `/login.astro`
- `/register.astro`
- Redirect logic: successful auth routes STUDENT → `/dashboard`, MENTOR → `/mentor/dashboard`, ADMIN → `/admin`.

### Components
- `LoginForm`, `RegisterForm` (email + password fields, client-side validation, error display)
- `AuthGuard` wrapper/util used by protected Astro pages to redirect unauthenticated users
- `Navbar` (role-aware links), `RoleBadge`, base page shells (`BaseLayout`, `StudentLayout`, `MentorLayout`)

### Acceptance Criteria
- [ ] Hitting a mentor-only endpoint as a student returns 403 with a consistent error JSON shape (`{ success: false, error: { code, message } }`).
- [ ] All thrown errors funnel through the centralized error middleware — no raw stack traces leak to the client in production mode.
- [ ] Logger writes structured request logs (method, path, status, duration, userId if present) without ever logging password or JWT values.
- [ ] `StudentLayout` and `MentorLayout` render distinct navigation without code duplication (shared `BaseLayout` underneath).
- [ ] Visiting a role-restricted Astro page while unauthenticated redirects to `/login`.
- [ ] Validation middleware rejects malformed request bodies with 400 and field-level error messages, verified against at least one existing route (register/login).
- [ ] Frontend login/register forms show inline validation errors and redirect correctly per role after success.

### Git Commit Message
```
feat(core): add RBAC middleware, centralized error handling, logging, and role-aware app shell
```

---

## Phase 4 — Emotional Status System ✅ COMPLETED

### Goal
Let students optionally attach an emotional state to themselves, a post, or a chat session. Add an optional **Urgency Level** (Low, Medium, High) to help mentors prioritize students without making medical judgments. This is built before Posts/Chat (Phase 5/6) so those phases can simply reference it.

### Features
- Fixed emotion enum: Happy, Excited, Confused, Homesick, Lonely, Scared, Anxious, Burnt Out, Overwhelmed, Stressed
- Optional **UrgencyLevel** enum: Low, Medium, High (student-selected, helps mentors prioritize)
- Endpoint to set/update a student's "current" emotional state (standalone, shown on dashboard/presence) with optional urgency level
- Emotion + urgency attachable at post-creation time and chat-message time (consumed by later phases, not built here)
- Mentor-facing endpoint to view recent emotion trends (aggregate, still anonymous) including urgency distribution

### Folder/File Additions
```
apps/api/src/
├── routes/emotion.routes.ts
├── controllers/emotion.controller.ts
├── services/emotion.service.ts
└── validators/emotion.validator.ts

apps/web/src/components/emotion/
├── EmotionPicker.tsx        # reusable selector used in Post composer, Chat header, Dashboard
├── UrgencyPicker.tsx        # optional urgency level selector (Low/Medium/High)
└── EmotionBadge.astro       # visual chip (color + icon per emotion)
```

### APIs to Build
- `POST /api/emotions` — body: `{ emotion, urgencyLevel?, context: "STANDALONE" }`. Creates an `EmotionLog` tied to the caller's `AnonymousIdentity`.
- `GET /api/emotions/me` — returns the student's most recent emotion entry with urgency level.
- `GET /api/emotions/trends` — **mentor/admin only**. Returns aggregate counts of emotions logged in a time window (e.g. last 24h), with urgency distribution — no identity attached, purely a chart-ready payload.

### Database Tables
No new tables — consumes `EmotionLog` from Phase 1 (updated to include `urgencyLevel` field).

### Frontend Pages
None standalone — `EmotionPicker` and `UrgencyPicker` are components consumed by Dashboard (Phase 9), Post composer (Phase 5), Chat (Phase 6).

### Components
- `EmotionPicker` (grid/list of selectable emotion chips, emits selected value)
- `UrgencyPicker` (simple Low/Medium/High selector, optional)
- `EmotionBadge` (read-only display chip, color-coded per emotion for scannability)

### Acceptance Criteria
- [ ] Emotion values are validated server-side against the fixed enum; arbitrary strings are rejected with 400.
- [ ] Urgency level is optional and validated against Low/Medium/High enum.
- [ ] Setting emotion is always optional at the API contract level (omitting it never errors on downstream Post/Chat creation once those exist).
- [ ] `GET /api/emotions/trends` is inaccessible (403) to a STUDENT-role token.
- [ ] `EmotionPicker` component is framework-agnostic enough to drop into at least two different composer contexts without modification (verified by a quick usage in a throwaway test page).
- [ ] Emotion color/icon mapping is defined once (single source of truth file) and reused by `EmotionBadge` everywhere.
- [ ] Urgency level appears in mentor dashboard's emotion overview for prioritization.

### Git Commit Message
```
feat(emotion): add emotional status logging with optional urgency level, trend aggregation, and reusable emotion UI components
```

---

## Phase 5 — Anonymous Posts & Replies ✅ COMPLETED

### Goal
Students can create anonymous posts (optionally tagged with emotion and urgency level, and categorized), and both students and mentors can reply — all under the anonymous identity system.

### Features
- Create post (title, body, optional emotion, optional urgency level, category)
- List posts (paginated, newest first; filter by emotion, category optionally)
- View single post with replies
- Reply to a post (student or mentor — mentor replies carry a "Verified Mentor" badge, still anonymous-name-wise for students but mentors' verified badge is visible since mentors are not anonymous)
- Soft-delete own post/reply
- Basic content validation (length limits, empty-body rejection)

### Folder/File Additions
```
apps/api/src/
├── routes/post.routes.ts
├── controllers/post.controller.ts
├── services/post.service.ts
└── validators/post.validator.ts

apps/web/src/
├── pages/
│   ├── posts/
│   │   ├── index.astro          # feed
│   │   ├── [id].astro           # single post + replies
│   │   └── new.astro            # composer
├── components/posts/
│   ├── PostCard.astro
│   ├── PostComposer.tsx
│   ├── ReplyList.tsx
│   └── ReplyComposer.tsx
```

### APIs to Build
- `POST /api/posts` — `{ title, body, emotion?, urgencyLevel?, category }` → creates Post under caller's AnonymousIdentity (students only; mentors do not start posts, per spec — mentors reply/start conversations/sessions, not anonymous posts).
- `GET /api/posts` — paginated list, query params: `page`, `limit`, `emotion` (optional filter), `category` (optional filter). Returns `anonymousDisplayName` (or "Verified Mentor" tag) per post/reply author, never real identity.
- `GET /api/posts/:id` — single post with nested replies.
- `POST /api/posts/:id/replies` — `{ body }` → creates PostReply (student or mentor caller).
- `DELETE /api/posts/:id` — soft-delete, only by original author (identity-matched via AnonymousIdentity, not exposed to client).
- `DELETE /api/posts/:id/replies/:replyId` — soft-delete own reply.

### Database Tables
No new tables — consumes `Post`, `PostReply` from Phase 1 (updated to include `category`, `urgencyLevel` fields).

### Frontend Pages
- `/posts` (feed, infinite scroll or pagination)
- `/posts/[id]` (thread view)
- `/posts/new` (composer, embeds `EmotionPicker`, `UrgencyPicker` from Phase 4, and `CategoryPicker`)

### Components
- `PostCard` (title, snippet, emotion badge, urgency indicator, category tag, reply count, relative timestamp)
- `PostComposer` (title + textarea + EmotionPicker + UrgencyPicker + CategoryPicker + submit)
- `ReplyList`, `ReplyComposer` (mentor replies visually distinguished via `RoleBadge`)
- `CategoryPicker` (dropdown/select for post categories)

### Acceptance Criteria
- [ ] A student can create a post and immediately see it in the feed with their consistent anonymous name (same name across multiple posts by the same student).
- [ ] A mentor replying to a post shows a "Verified Mentor" badge but no real name/email.
- [ ] Attempting to delete another user's post/reply returns 403.
- [ ] Feed pagination returns correct `hasMore`/`nextPage` metadata and performs acceptably with 500+ seeded posts (basic index check on `createdAt`).
- [ ] Emotion filter on `GET /api/posts` correctly narrows results.
- [ ] Category filter on `GET /api/posts` correctly narrows results.
- [ ] Deleted posts/replies are excluded from all read endpoints but retained in DB (`isDeleted=true`) for audit purposes.
- [ ] XSS-safe rendering of post body (no raw HTML injection) verified with a test post containing `<script>` tags.

### Git Commit Message
```
feat(posts): implement anonymous post creation with categories, urgency, feed, threaded replies with mentor badges
```

---

## Phase 6 — Anonymous Private Chat (Realtime) ✅ COMPLETED

### Goal
A student can privately message a mentor (or a mentor can initiate contact with a student who posted/logged an emotion) with real-time delivery via Socket.io, while identity anonymity rules from Phase 2 remain enforced. **Students do not manually choose a mentor** — instead, the backend automatically assigns an available mentor using a simple strategy (least active or round-robin).

### Features
- Start a chat thread (student requests support → backend auto-assigns available mentor; or mentor → student in response to a post)
- Send/receive messages in real time
- Typing indicators (nice-to-have, can be flagged optional within this phase)
- Read receipts (`readAt` timestamp)
- Mentor sees student's current/most recent emotion inline in the chat header
- Chat list (inbox) for both roles
- **Mentor auto-assignment**: simple strategy (least active mentor or round-robin) for MVP

### Folder/File Additions
```
apps/api/src/
├── routes/chat.routes.ts
├── controllers/chat.controller.ts
├── services/chat.service.ts
├── validators/chat.validator.ts
├── services/mentorAssignment.service.ts   # simple assignment logic (least active / round-robin)
└── sockets/
    ├── index.ts                 # io initialization, auth handshake via JWT
    ├── chat.socket.ts           # join room, message events, typing events
    └── presence.socket.ts       # mentor online/offline tracking (feeds Phase 4/9 "mentors online")

apps/web/src/
├── pages/chat/
│   ├── index.astro              # inbox
│   └── [threadId].astro         # conversation view
├── components/chat/
│   ├── ChatList.tsx
│   ├── ChatWindow.tsx
│   ├── MessageBubble.astro
│   └── TypingIndicator.tsx
└── lib/socket.ts                # client Socket.io connection helper (attaches JWT)
```

### APIs to Build
- `POST /api/chats` — `{ studentIdentityId }` (mentor-initiated, e.g., from post) **OR** empty body (student-initiated; backend auto-assigns available mentor) → creates/returns existing `ChatThread`.
- `GET /api/chats` — list threads for current user (role-aware: student sees mentor names + verified badge; mentor sees anonymous student names + latest emotion).
- `GET /api/chats/:id/messages` — paginated message history for a thread (authorization: caller must be a participant).
- `POST /api/chats/:id/messages` — REST fallback for sending (primary path is Socket.io event, this covers non-socket clients/tests).
- `PATCH /api/chats/:id/read` — marks messages as read.

**Socket events:**
- `chat:join` (room = threadId), `chat:message` (emit/broadcast), `chat:typing`, `chat:read`, `presence:mentorOnline`, `presence:mentorOffline`

### Database Tables
No new tables — consumes `ChatThread`, `ChatMessage` from Phase 1.

### Frontend Pages
- `/chat` (inbox list)
- `/chat/[threadId]` (live conversation)

### Components
- `ChatList` (thread previews, unread indicator)
- `ChatWindow` (message stream + composer, mounts socket connection)
- `MessageBubble` (sender-aware styling, mentor badge vs anonymous name)
- `TypingIndicator`

### Acceptance Criteria
- [ ] Socket connections require a valid JWT during handshake; unauthenticated socket connections are rejected.
- [ ] Messages sent via socket are persisted to `ChatMessage` and delivered to the other participant in under 1s locally.
- [ ] A student's real identity is never present in any socket payload — only `anonymousDisplayName`/`anonymousIdentityId`.
- [ ] Mentor's chat header displays the student's latest logged emotion (pulled via Phase 4's emotion service).
- [ ] Reloading `/chat/[threadId]` restores full message history from the REST endpoint, then socket picks up live updates seamlessly (no duplicate messages).
- [ ] A student cannot open a chat thread belonging to another student (403 on mismatched participant check).
- [ ] Mentor online/offline presence updates `MentorProfile.isOnline` and is broadcast to relevant clients.
- [ ] Student-initiated chat request auto-assigns an available mentor (AVAILABLE status) using least-active or round-robin strategy; if no mentor available, returns appropriate response (queue or error).
- [ ] Mentor assignment logic is in a dedicated service (`mentorAssignment.service.ts`) and tested independently.

### Git Commit Message
```
feat(chat): implement realtime anonymous chat with Socket.io, auto mentor assignment, read receipts, and mentor presence
```

---

## Phase 7 — Mentor Verification & Mentor-Specific Features

### Goal
Formalize the mentor role: verified badge display rules, mentor profile management, mentor availability status, and mentor-specific capabilities (starting conversations proactively, viewing prioritized student emotions).

### Features
- Mentor profile CRUD (bio, department, specialties)
- **Mentor availability status**: Available, Busy, Offline — students can see mentor availability before requesting support
- Admin-driven verification flag (`isVerifiedMentor`) — toggled in Phase 10, consumed here
- Mentor can browse recent posts/emotions sorted by "priority" (e.g. Anxious/Overwhelmed/Scared surfaced first)
- Mentor can proactively start a chat with a student based on a post (uses Phase 6 API)
- Verified badge component finalized and applied consistently across Posts, Chat, Meetings (mentor-hosted)

### Folder/File Additions
```
apps/api/src/
├── routes/mentor.routes.ts
├── controllers/mentor.controller.ts
├── services/mentor.service.ts
└── validators/mentor.validator.ts

apps/web/src/
├── pages/mentor/
│   ├── profile.astro
│   └── priority-feed.astro      # emotion-sorted post feed for mentors
└── components/mentor/
    ├── MentorProfileForm.tsx
    ├── VerifiedBadge.astro
    ├── AvailabilityBadge.astro  # shows Available/Busy/Offline status
    └── PriorityPostList.tsx
```

### APIs to Build
- `GET /api/mentors/me/profile` — mentor's own profile.
- `PATCH /api/mentors/me/profile` — update bio/department/specialties.
- `PATCH /api/mentors/me/availability` — update availability status (AVAILABLE | BUSY | OFFLINE).
- `GET /api/mentors` — public-ish list of mentors (name, department, specialties, availability status, online status, verified badge) — visible to students requesting support.
- `GET /api/mentors/priority-feed` — mentor-only; posts sorted by emotion urgency ranking (defined priority order: Overwhelmed/Anxious/Scared > Stressed/Burnt Out/Homesick/Lonely > Confused > Happy/Excited).

### Database Tables
No new tables — consumes `MentorProfile` from Phase 1 (updated to include `availabilityStatus` field).

### Frontend Pages
- `/mentor/profile`
- `/mentor/priority-feed`

### Components
- `MentorProfileForm`, `VerifiedBadge` (single source of truth used everywhere a mentor is displayed), `AvailabilityBadge` (shows Available/Busy/Offline), `PriorityPostList`

### Acceptance Criteria
- [ ] A non-verified mentor account (`isVerifiedMentor=false`) cannot reply to posts or start chats — attempts return 403 with a clear "pending verification" message.
- [ ] `VerifiedBadge` is the only component rendering the badge anywhere in the app (grep check — no duplicated badge markup).
- [ ] `AvailabilityBadge` correctly displays mentor availability status.
- [ ] Priority feed ordering matches the documented emotion urgency ranking, verified against seeded data with mixed emotions.
- [ ] Mentor list (`GET /api/mentors`) never exposes email or internal userId to the frontend response — only public profile fields including availability status.
- [ ] Updating a mentor profile reflects immediately in `GET /api/mentors` (no caching staleness in dev).
- [ ] Students can see mentor availability before requesting chat support.

### Git Commit Message
```
feat(mentor): add mentor profiles, verification gating, availability status, and emotion-priority post feed
```

---

## Phase 8 — Meetings & Workshops

### Goal
Support two distinct event types:
- **Meetings**: Student- or mentor-created small group sessions (study groups, peer discussions, mentor office hours)
- **Workshops**: Mentor-hosted scheduled events with registration, attendance tracking, and post-event resources

Both support online (Google Meet, Zoom) and offline (Library Study Group, Cafeteria Meetup, Hostel Common Room) formats.

### Features
#### Meetings
- Create meeting (title, description, date, time, duration, meeting type, link/location, category)
- Two host types: STUDENT (informal meetups) and MENTOR (structured sessions)
- Browse/filter meetings (upcoming, by category, by host type)
- RSVP/attend a meeting
- Meeting detail view
- Basic validation (date/time must be in the future)

#### Workshops
- Mentor creates workshop (title, description, date, time, duration, meeting type, link/location, category, max attendees, resources)
- Student registration with capacity limits
- Attendance tracking (registered → attended)
- Post-workshop resources (PDFs, links, materials)
- Workshop detail view with registration status

### Folder/File Additions
```
apps/api/src/
├── routes/meeting.routes.ts
├── controllers/meeting.controller.ts
├── services/meeting.service.ts
├── validators/meeting.validator.ts
├── routes/workshop.routes.ts
├── controllers/workshop.controller.ts
├── services/workshop.service.ts
└── validators/workshop.validator.ts

apps/web/src/
├── pages/meetings/
│   ├── index.astro              # browse/filter meetings
│   ├── [id].astro                # detail + RSVP
│   └── new.astro                 # create (student or mentor, form adapts)
├── pages/workshops/
│   ├── index.astro              # browse/filter workshops
│   ├── [id].astro                # detail + register
│   └── new.astro                 # create (mentor only)
└── components/meetings/
    ├── MeetingCard.astro
    ├── MeetingForm.tsx
    ├── MeetingFilterBar.tsx
    ├── AttendeeList.tsx
    ├── WorkshopCard.astro
    ├── WorkshopForm.tsx
    ├── WorkshopFilterBar.tsx
    └── RegistrationStatus.tsx
```

### APIs to Build
#### Meetings
- `POST /api/meetings` — `{ title, description, date, time, durationMinutes, meetingType (ONLINE | OFFLINE), meetingLink (nullable, for online), location (nullable, for offline), category, hostType }`. `hostIdentityId`/`hostUserId` derived server-side from caller.
- `GET /api/meetings` — filterable list (`upcoming=true`, `category`, `hostType`), paginated.
- `GET /api/meetings/:id` — detail with attendee count/list (attendees shown as anonymous names for students, verified badge for mentor hosts).
- `POST /api/meetings/:id/rsvp` — join meeting as attendee.
- `DELETE /api/meetings/:id/rsvp` — leave/cancel RSVP.
- `DELETE /api/meetings/:id` — host-only cancellation.

#### Workshops
- `POST /api/workshops` — mentor only: `{ title, description, date, time, durationMinutes, meetingType (ONLINE | OFFLINE), meetingLink, location, category, maxAttendees, resources }` → creates Workshop.
- `GET /api/workshops` — filterable list (`upcoming=true`, `category`), paginated.
- `GET /api/workshops/:id` — detail with registration count, attendee list, resources.
- `POST /api/workshops/:id/register` — student registers (checks capacity).
- `DELETE /api/workshops/:id/register` — cancel registration.
- `POST /api/workshops/:id/attendance` — mentor marks attendance (REGISTERED → ATTENDED).
- `DELETE /api/workshops/:id` — mentor cancels workshop.

### Database Tables
No new tables — consumes `Meeting`, `MeetingAttendee`, `Workshop`, `WorkshopRegistration` from Phase 1.

### Frontend Pages
- `/meetings` (browse)
- `/meetings/[id]` (detail)
- `/meetings/new` (create)
- `/workshops` (browse)
- `/workshops/[id]` (detail + register)
- `/workshops/new` (create, mentor only)

### Components
- `MeetingCard`, `MeetingForm` (adapts field set/copy based on host type), `MeetingFilterBar`, `AttendeeList`
- `WorkshopCard`, `WorkshopForm`, `WorkshopFilterBar`, `RegistrationStatus`

### Acceptance Criteria
- [ ] Creating a meeting/workshop with a past date/time is rejected with a validation error.
- [ ] Student-hosted and mentor-hosted meetings are visually distinguishable in the list (badge/category tag) without exposing extra host PII.
- [ ] Workshops show meeting type (Online/Offline) with appropriate link or location.
- [ ] RSVPing/registering twice to the same event does not create duplicate rows (idempotent).
- [ ] Workshop registration respects `maxAttendees` capacity limit.
- [ ] Only the host/mentor can delete/cancel their own event; others get 403.
- [ ] Filtering by category and `upcoming=true` returns correctly scoped results against seeded data spanning past/future dates.
- [ ] Attendee list on meeting detail shows anonymous names for student attendees.
- [ ] Workshop resources are displayed after the event date for attendees.

### Git Commit Message
```
feat(meetings-workshops): implement student/mentor meetings and mentor-hosted workshops with registration, attendance, and resources
```

---

## Phase 9 — Resource Hub

### Goal
Provide a comprehensive Resource Hub accessible to every student with curated mental health and campus resources. This is a critical project requirement that was missing from the original roadmap.

### Features
- Centralized resource library with categories
- University Counseling Center information
- Emergency Contacts (campus security, local emergency, crisis lines)
- Faculty Advisors directory
- Student Welfare Office contacts
- Campus Clubs listing
- Self-help PDFs (downloadable)
- Stress Management Resources
- Sleep Hygiene Resources
- External Helplines (configured by university)
- Search and filter by category
- Resource detail view with full content

### Folder/File Additions
```
apps/api/src/
├── routes/resource.routes.ts
├── controllers/resource.controller.ts
├── services/resource.service.ts
└── validators/resource.validator.ts

apps/web/src/
├── pages/resources/
│   ├── index.astro              # browse/filter resources
│   └── [id].astro                # resource detail
└── components/resources/
    ├── ResourceCard.astro
    ├── ResourceList.tsx
    ├── ResourceFilterBar.tsx
    └── ResourceCategoryBadge.astro
```

### APIs to Build
- `GET /api/resources` — filterable list (`category`, `search`), paginated. Returns all active resources.
- `GET /api/resources/:id` — resource detail with full content.
- `GET /api/resources/categories` — returns list of resource categories with counts (for filter UI).

Categories:
- COUNSELING_CENTER
- EMERGENCY_CONTACTS
- FACULTY_ADVISORS
- STUDENT_WELFARE
- CAMPUS_CLUBS
- SELF_HELP_PDFS
- STRESS_MANAGEMENT
- SLEEP_HYGIENE
- EXTERNAL_HELPLINES

### Database Tables
No new tables — consumes `Resource` table from Phase 1.

### Frontend Pages
- `/resources` (browse with category filters)
- `/resources/[id]` (resource detail view)

### Components
- `ResourceCard` (title, category badge, short description)
- `ResourceList` (grid/list view with filters)
- `ResourceFilterBar` (category tabs + search)
- `ResourceCategoryBadge` (color-coded per category)

### Acceptance Criteria
- [ ] All 9 resource categories are represented with at least one seeded resource each.
- [ ] Students can filter by category and search by keyword.
- [ ] Resource detail view displays full content (text, links, downloadable PDFs).
- [ ] External helplines show phone numbers and operating hours clearly.
- [ ] Resource list is accessible to all authenticated students (no role restriction).
- [ ] Admin can manage resources via Phase 10 Admin Panel (CRUD for resources).

### Git Commit Message
```
feat(resources): add resource hub with counseling, emergency contacts, self-help PDFs, and external helplines
```

---

## Phase 10 — Student & Mentor Dashboards

### Goal
Bring together previously built features into single-glance, modern, professional dashboards for each role. The dashboard should feel modern and professional — research modern dashboard patterns from high-quality design systems (Vercel Geist, Linear, Notion, GitHub) and apply those patterns. Keep layout minimal and professional.

### Features

**Student Dashboard**
- Current Emotion (with urgency indicator)
- Upcoming Meetings (RSVP'd + recommended)
- Upcoming Workshops (registered)
- Resources (quick access cards)
- Active Chats (unread count + quick access)
- Recent Discussions (latest posts from feed)
- Announcements (admin/platform announcements)

**Mentor Dashboard**
- Waiting Chats (students awaiting mentor assignment)
- Assigned Students (with emotion overview)
- Student Emotion Overview (aggregate + priority students)
- Today's Meetings (hosted or attending)
- Today's Workshops (hosted)
- Mentor Availability Toggle (Available/Busy/Offline)
- Recent Discussions (posts needing mentor response)
- Announcements

**Admin Dashboard**
- Platform Statistics (users, posts, chats, meetings, workshops)
- Active Students (count, recent signups)
- Active Mentors (count, verification status)
- Meetings Overview
- Workshops Overview
- Reports (flagged content, moderation queue)

### Folder/File Additions
```
apps/api/src/
├── routes/dashboard.routes.ts
├── controllers/dashboard.controller.ts
└── services/dashboard.service.ts    # aggregates existing services, no new DB writes

apps/web/src/
├── pages/
│   ├── dashboard.astro              # student
│   ├── mentor/dashboard.astro
│   └── admin/dashboard.astro
└── components/dashboard/
    ├── EmotionSummaryCard.astro
    ├── UpcomingMeetingsWidget.tsx
    ├── UpcomingWorkshopsWidget.tsx
    ├── ResourcesQuickAccessWidget.tsx
    ├── ActiveChatsWidget.tsx
    ├── RecentDiscussionsWidget.tsx
    ├── AnnouncementsWidget.tsx
    ├── WaitingChatsWidget.tsx
    ├── AssignedStudentsWidget.tsx
    ├── StudentEmotionOverviewWidget.tsx
    ├── TodaysMeetingsWidget.tsx
    ├── TodaysWorkshopsWidget.tsx
    ├── MentorAvailabilityToggle.tsx
    ├── PlatformStatsWidget.tsx
    ├── ActiveUsersWidget.tsx
    ├── EventsOverviewWidget.tsx
    └── ReportsWidget.tsx
```

### APIs to Build
- `GET /api/dashboard/student` — single aggregated payload: `{ currentEmotion, upcomingMeetings[], upcomingWorkshops[], resourcesPreview[], activeChats[], recentDiscussions[], announcements[] }`.
- `GET /api/dashboard/mentor` — aggregated payload: `{ waitingChats[], assignedStudents[], studentEmotionOverview, todaysMeetings[], todaysWorkshops[], mentorAvailability, recentDiscussions[], announcements[] }`.
- `GET /api/dashboard/admin` — aggregated payload: `{ platformStats, activeStudents[], activeMentors[], meetingsOverview[], workshopsOverview[], reports[] }`.
- `PATCH /api/mentors/me/availability` — mentor updates availability status (AVAILABLE | BUSY | OFFLINE).

All endpoints internally call existing Phase 4–9 services rather than querying tables directly, keeping business logic in one place.

### Database Tables
None new — pure aggregation layer.

### Frontend Pages
- `/dashboard` (student)
- `/mentor/dashboard`
- `/admin/dashboard`

### Components
- Student: `EmotionSummaryCard`, `UpcomingMeetingsWidget`, `UpcomingWorkshopsWidget`, `ResourcesQuickAccessWidget`, `ActiveChatsWidget`, `RecentDiscussionsWidget`, `AnnouncementsWidget`
- Mentor: `WaitingChatsWidget`, `AssignedStudentsWidget`, `StudentEmotionOverviewWidget`, `TodaysMeetingsWidget`, `TodaysWorkshopsWidget`, `MentorAvailabilityToggle`, `RecentDiscussionsWidget`, `AnnouncementsWidget`
- Admin: `PlatformStatsWidget`, `ActiveUsersWidget`, `EventsOverviewWidget`, `ReportsWidget`

Design guidance: Use Geist design system tokens (from `docs/design.md`). Cards with subtle borders (gray-300), 16px padding, 12px radius. 8px spacing within groups, 16px between groups, 32px between sections. Typography: heading-20 for section titles, label-14 for metadata, copy-14 for body. Primary actions use button-primary, secondary use button-tertiary. Empty states use gray-600 text with helpful copy.

### Acceptance Criteria
- [ ] `GET /api/dashboard/student` returns within acceptable latency (single request, service-layer parallelized calls via `Promise.all`).
- [ ] `GET /api/dashboard/mentor` returns within acceptable latency with aggregated data.
- [ ] `GET /api/dashboard/admin` returns platform statistics correctly.
- [ ] Dashboard widgets gracefully render empty states (e.g., "No upcoming meetings yet") rather than breaking on empty arrays.
- [ ] Mentor dashboard's "waiting chats" correctly reflects unassigned student chat requests from Phase 6.
- [ ] Student dashboard's "active chats" correctly reflects unread message counts from Phase 6.
- [ ] Mentor availability toggle updates `MentorProfile.availabilityStatus` and broadcasts via Socket.io presence.
- [ ] Role mismatch (student hitting `/api/dashboard/mentor` or `/api/dashboard/admin`) returns 403.
- [ ] Visual QA: all three dashboards are responsive down to mobile width (375px), tablet (768px), and desktop (1280px) per design system breakpoints.
- [ ] Layout follows modern dashboard patterns: sidebar navigation (collapsible on mobile), top bar with user avatar/notifications, main content area with card grid.

### Git Commit Message
```
feat(dashboard): add modern professional student, mentor, and admin dashboards with aggregated widgets
```

---

## Phase 11 — Admin Panel

### Goal
Give administrators the ability to manage mentors, students, meetings, workshops, and resources — including the mentor verification toggle that Phase 7 depends on conceptually.

### Features
- List/search students and mentors
- Verify/unverify a mentor
- Deactivate/reactivate a user account
- View/cancel any meeting
- View/cancel any workshop
- Manage resources (CRUD for Resource Hub)
- View basic platform stats (post count, active chats, meetings this week, workshops, resources)
- Admin action logging (audit trail)

### Folder/File Additions
```
apps/api/src/
├── routes/admin.routes.ts
├── controllers/admin.controller.ts
├── services/admin.service.ts
└── validators/admin.validator.ts

apps/web/src/
├── pages/admin/
│   ├── index.astro                 # stats overview
│   ├── mentors.astro
│   ├── students.astro
│   ├── meetings.astro
│   ├── workshops.astro
│   └── resources.astro
└── components/admin/
    ├── StatsGrid.astro
    ├── UserTable.tsx
    ├── MentorVerifyToggle.tsx
    ├── AdminMeetingTable.tsx
    ├── AdminWorkshopTable.tsx
    └── AdminResourceTable.tsx
```

### APIs to Build
- `GET /api/admin/stats` — platform overview numbers.
- `GET /api/admin/users` — paginated, filterable by role/status.
- `PATCH /api/admin/mentors/:id/verify` — sets `isVerifiedMentor=true/false`, writes `AdminActionLog`.
- `PATCH /api/admin/users/:id/status` — activate/deactivate, writes `AdminActionLog`.
- `GET /api/admin/meetings` — all meetings, admin view.
- `DELETE /api/admin/meetings/:id` — force-cancel any meeting, writes `AdminActionLog`.
- `GET /api/admin/workshops` — all workshops, admin view.
- `DELETE /api/admin/workshops/:id` — force-cancel any workshop, writes `AdminActionLog`.
- `GET /api/admin/resources` — all resources, admin view.
- `POST /api/admin/resources` — create resource.
- `PATCH /api/admin/resources/:id` — update resource.
- `DELETE /api/admin/resources/:id` — delete resource.

All routes gated by `requireRole(['ADMIN'])` from Phase 3.

### Database Tables
No new tables — consumes `AdminActionLog` from Phase 1, writes to `User`, `MentorProfile`, `Meeting`, `Workshop`, `Resource`.

### Frontend Pages
- `/admin` (overview)
- `/admin/mentors`
- `/admin/students`
- `/admin/meetings`
- `/admin/workshops`
- `/admin/resources`

### Components
- `StatsGrid`, `UserTable` (reusable for both students and mentors views), `MentorVerifyToggle`, `AdminMeetingTable`, `AdminWorkshopTable`, `AdminResourceTable`

### Acceptance Criteria
- [ ] Only ADMIN-role accounts can reach any `/admin/*` page or `/api/admin/*` route (verified for both a STUDENT and MENTOR token — both get 403).
- [ ] Toggling mentor verification immediately affects that mentor's ability to reply/chat (cross-checked against Phase 7's gating logic).
- [ ] Every admin mutation (`verify`, `status` change, `meeting delete`, `workshop delete`, `resource CRUD`) writes a corresponding `AdminActionLog` row with the acting admin's id.
- [ ] Deactivating a user immediately blocks their next authenticated request (checked in Phase 2's auth middleware — deactivated users' JWTs are rejected on next validation).
- [ ] Admin stats numbers match ground truth against seeded data (spot-checked manually).
- [ ] Admin can manage resources (create, update, delete) for the Resource Hub.

### Git Commit Message
```
feat(admin): add admin panel for mentor verification, user management, meeting/workshop oversight, resource management, and audit logging
```

---

## Phase 12 — Realtime Notifications & Presence Polish

### Goal
Round out the realtime layer beyond chat: live notification badges for new replies/messages/meeting reminders, and finalize the "mentors online" presence system referenced since Phase 6/9.

### Features
- In-app notification feed (new reply on your post, new chat message, meeting starting soon)
- Socket-driven unread badge counts (navbar)
- Presence system finalized: mentor online/offline broadcast to all connected clients viewing mentor lists
- Notification preferences are out of scope for MVP (no email/push) — in-app only, explicitly noted

### Folder/File Additions
```
apps/api/src/
├── routes/notification.routes.ts
├── controllers/notification.controller.ts
├── services/notification.service.ts
└── sockets/notification.socket.ts

apps/web/src/components/notifications/
├── NotificationBell.tsx
├── NotificationList.tsx
└── NotificationToast.tsx
```

*Note:* If a `Notification` table wasn't anticipated in Phase 1, add it here explicitly as a schema addition (documented deviation): `Notification` — id, recipientIdentityId/recipientUserId, type, payload (JSON), isRead, createdAt. Run a fresh Prisma migration for this single addition.

### APIs to Build
- `GET /api/notifications` — paginated, unread-first.
- `PATCH /api/notifications/:id/read` — mark single as read.
- `PATCH /api/notifications/read-all` — bulk mark read.

**Socket events:** `notification:new` (server → client push), `presence:update` (broadcast mentor online list diff).

### Database Tables
- **Notification** (new, added this phase — see note above)

### Frontend Pages
None new — `NotificationBell`/`NotificationList` mount into the existing `Navbar` from Phase 3.

### Components
- `NotificationBell` (badge count, dropdown trigger), `NotificationList`, `NotificationToast` (transient popup on live event)

### Acceptance Criteria
- [ ] New post reply triggers a `notification:new` socket event to the original post author within 1s.
- [ ] Notification bell badge count matches unread count from `GET /api/notifications` on page load and updates live via socket without a refresh.
- [ ] Marking all as read clears the badge and persists across reload.
- [ ] Mentor presence list on the dashboard (Phase 9) updates live when a mentor connects/disconnects, without a page refresh.
- [ ] No notification ever leaks a student's real identity to a mentor or vice versa.

### Git Commit Message
```
feat(notifications): add realtime in-app notifications and finalize mentor presence broadcasting
```

---

## Phase 13 — Security Hardening, Validation & Observability

### Goal
Treat this as the "harden everything already built" pass — a dedicated phase rather than scattered afterthoughts, since privacy-first is a stated non-negotiable requirement.

### Features
- Full input validation audit across every route (every body/query/param schema-checked)
- Helmet.js (or equivalent) security headers
- CORS locked to known frontend origin(s)
- Rate limiting expanded beyond login (posts, chat messages, meeting creation)
- Structured request/error logging finalized (correlation IDs)
- Anonymity audit: automated test suite specifically asserting no endpoint ever returns `User.universityEmail` or raw `userId` for a STUDENT-derived resource
- Secrets/env var audit — confirm nothing sensitive is hardcoded anywhere in the repo

### Folder/File Additions
```
apps/api/src/
├── middlewares/security.middleware.ts    # helmet, cors config
├── middlewares/rateLimiter.middleware.ts  # expanded, per-route configs
└── tests/
    ├── anonymity.audit.test.ts            # explicit privacy regression suite
    ├── auth.test.ts
    ├── posts.test.ts
    ├── chat.test.ts
    └── meetings.test.ts
```

### APIs to Build
None new — this phase modifies existing endpoints' middleware chains and adds test coverage; no new routes.

### Database Tables
None new.

### Frontend Pages
None new.

### Components
None new — this phase may add minor UX for rate-limit feedback (e.g. "You're posting too fast" toast) reusing existing toast/notification components from Phase 11.

### Acceptance Criteria
- [ ] `anonymity.audit.test.ts` programmatically checks every response payload from Post, Chat, Meeting, Dashboard endpoints for the presence of email/userId fields tied to student data — suite passes with zero leaks.
- [ ] Security headers (CSP, X-Frame-Options, etc.) present on all API responses, verified via a manual `curl -I` check or automated test.
- [ ] CORS rejects requests from an arbitrary unlisted origin in a test call.
- [ ] Rate limits are enforced on post creation, chat message sending, and meeting creation with documented thresholds.
- [ ] No secret values (JWT secret, DB password) appear anywhere in the git history or source files — confirmed via a repo-wide grep before this phase's commit.
- [ ] All Phase 12 tests are runnable via a single `npm run test` command and pass in CI-equivalent local run.

### Git Commit Message
```
chore(security): harden validation, headers, rate limiting, and add anonymity regression test suite
```

---

## Phase 14 — Dockerization & Deployment Readiness

### Goal
Finalize multi-container Docker setup for production-like local running and prepare the project to be deployed as a unit.

### Features
- Production-grade Dockerfiles for `web` and `api` (multi-stage builds)
- `docker-compose.yml` finalized for production profile vs. `docker-compose.dev.yml` for local dev (already partially exists from Phase 0 — this phase formalizes the split)
- Environment variable documentation finalized (single `ENVIRONMENT.md` listing every var, purpose, and example)
- Database migration run as a startup step in the container entrypoint (not manual)
- Basic reverse-proxy consideration documented (e.g. Nginx in front of both services) — configuration provided even if not required for local grading

### Folder/File Additions
```
docker/
├── web.Dockerfile          # multi-stage: build Astro static/SSR output, serve
├── api.Dockerfile          # multi-stage: build TS, run compiled JS
├── docker-compose.yml      # production profile
├── docker-compose.dev.yml  # dev profile (hot reload, volumes)
├── nginx/
│   └── nginx.conf          # optional reverse proxy config
└── entrypoint.sh           # runs prisma migrate deploy, then starts server

ENVIRONMENT.md              # root-level, documents every env var across both apps
```

### APIs to Build
None new.

### Database Tables
None new.

### Frontend Pages
None new.

### Components
None new.

### Acceptance Criteria
- [ ] `docker compose -f docker/docker-compose.yml up --build` boots the entire stack (web, api, postgres) from a clean clone with zero manual steps beyond copying `.env.example` to `.env`.
- [ ] Database migrations run automatically on container start (no manual `prisma migrate deploy` needed).
- [ ] `web.Dockerfile` and `api.Dockerfile` use multi-stage builds resulting in production images with no dev dependencies or source maps bloating the final image.
- [ ] `ENVIRONMENT.md` lists every single environment variable used anywhere in the codebase — cross-checked against a grep of `process.env.` and `import.meta.env.` usages.
- [ ] Containers restart cleanly and reconnect to Postgres if the DB container is slower to start (basic wait-for/retry logic in entrypoint).

### Git Commit Message
```
build(docker): finalize production Docker images, compose profiles, and automated migration entrypoint
```

---

## Phase 15 — Testing, QA & Bug Bash

### Goal
Dedicated stabilization phase: expand automated test coverage beyond Phase 12's security-focused suite to cover general functional correctness, then manually walk every user flow end-to-end.

### Features
- Unit tests for all service-layer functions (auth, identity, posts, chat, meetings, mentor, admin, notifications)
- Integration tests for critical multi-step flows (register → auto-identity → post → mentor reply → chat → meeting RSVP)
- Manual QA checklist covering every MVP feature listed in the original spec, executed against a seeded environment
- Bug tracking doc (even informal — a `KNOWN_ISSUES.md`) for anything found but deferred post-MVP

### Folder/File Additions
```
apps/api/src/tests/
├── unit/
│   ├── identity.service.test.ts
│   ├── post.service.test.ts
│   ├── chat.service.test.ts
│   ├── meeting.service.test.ts
│   └── admin.service.test.ts
└── integration/
    └── student-full-journey.test.ts   # register → post → chat → meeting

QA_CHECKLIST.md
KNOWN_ISSUES.md
```

### APIs to Build
None new — coverage only.

### Database Tables
None new.

### Frontend Pages
None new.

### Components
None new.

### Acceptance Criteria
- [ ] Service-layer unit test coverage exceeds an agreed threshold (e.g. 70%+ on `services/`) — measured via coverage tool output.
- [ ] `student-full-journey.test.ts` passes end-to-end against a test database, covering: register → login → auto-identity assigned → create post → mentor replies → student starts chat → RSVP to a meeting.
- [ ] `QA_CHECKLIST.md` is filled out with a pass/fail per every MVP feature bullet from the original spec (Anonymous Student, Verified Mentors, Emotional Status, Anonymous Posts, Anonymous Chat, Meetings, Dashboards, Admin) — no unchecked items at phase close.
- [ ] Any discovered bug is either fixed in this phase or explicitly logged in `KNOWN_ISSUES.md` with severity and a note on whether it blocks MVP sign-off.
- [ ] No `console.log` debug statements remain in production code paths (grep check).

### Git Commit Message
```
test(qa): add unit/integration test coverage and complete full MVP QA pass
```

---

## Phase 16 — Production-Ready MVP Finalization

### Goal
The final polish pass: everything from prior phases is integrated, documented, and presentable as a complete, demoable, production-ready MVP.

### Features
- Full `README.md` rewrite: project overview, architecture diagram (textual/ASCII acceptable), setup instructions, feature list, screenshots/gifs placeholders
- Final accessibility/responsiveness pass across all pages (mobile, tablet, desktop breakpoints)
- Final privacy-first audit summary document (`PRIVACY.md`) explaining exactly how anonymity is technically guaranteed, for grading/demo purposes
- Performance pass: verify no N+1 queries in dashboard/feed endpoints (Prisma `include`/`select` review)
- Version tag / release cut (e.g. `v1.0.0-mvp`)

### Folder/File Additions
```
README.md                  # rewritten, comprehensive
PRIVACY.md                 # explains identity-separation architecture in plain language
ARCHITECTURE.md            # diagrams + explanation of monorepo, data flow, socket flow
CHANGELOG.md               # summarizes phases 0–15 as release notes
```

### APIs to Build
None new — this phase is integration, documentation, and polish only.

### Database Tables
None new.

### Frontend Pages
None new — final responsive QA pass across all existing pages from Phases 2–11.

### Components
None new.

### Acceptance Criteria
- [ ] A developer who has never seen the project can clone the repo, follow `README.md`, and have the full stack running via Docker in under 10 minutes.
- [ ] `PRIVACY.md` accurately and completely describes the `User ↔ AnonymousIdentity` separation and lists every safeguard implemented (Phase 2 identity isolation, Phase 12 anonymity audit suite, mentor badge-not-name display, etc.).
- [ ] Every page passes a manual responsive check at 375px, 768px, and 1280px widths with no layout breakage.
- [ ] Dashboard and feed endpoints are reviewed for N+1 query patterns; any found are fixed using Prisma `include`/`select` optimization.
- [ ] Full MVP feature checklist from the original spec is demoable live: student login → anonymous identity → emotion tagging → anonymous post → mentor reply with verified badge → anonymous chat → meeting creation/RSVP → student dashboard → mentor dashboard → admin mentor verification.
- [ ] Repository is tagged (`git tag v1.0.0-mvp`) marking the production-ready MVP milestone.

### Git Commit Message
```
docs(release): finalize documentation, privacy audit, responsive polish, and cut v1.0.0-mvp
```

---

## Future Improvements (Post-MVP)

The following features are intentionally deferred to keep the MVP lean and shippable. They should be considered for future iterations after the competition.

### AI & Intelligence
- **AI Assistant / Chatbot** — Automated first-line support using LLMs for common student concerns
- **AI Therapist / Coach** — Guided CBT exercises, mood analysis, personalized coping strategies
- **AI Recommendations** — Personalized resource suggestions based on emotion history and post content
- **AI Moderation** — Automated content filtering for crisis keywords, self-harm detection, toxicity

### Notifications & Engagement
- **Push Notifications** — Mobile/web push for chat messages, meeting reminders, workshop registrations
- **Email Digests** — Weekly summaries of discussions, upcoming events, resource highlights
- **In-App Notification Preferences** — Granular control over notification types and frequency

### Analytics & Insights
- **Advanced Analytics Dashboard** — Cohort analysis, retention funnels, emotion trend forecasting
- **Mentor Performance Metrics** — Response time, student satisfaction, engagement rates
- **Predictive Risk Scoring** — Early identification of students needing proactive outreach (with strict privacy controls)

### Platform Features
- **Group Chats** — Multi-student peer support circles moderated by mentors
- **Anonymous Voice/Video Notes** — Audio messages in chat for more personal connection
- **Crisis Mode** — One-tap emergency contact with location sharing to campus security
- **Gamification** — Streaks, badges for consistent emotional check-ins, peer support participation
- **Mobile App** — React Native / Expo wrapper for iOS/Android with native push
- **Multi-language Support** — i18n for international student populations

### Integrations
- **Calendar Sync** — Google Calendar, Outlook integration for meetings/workshops
- **LMS Integration** — Canvas, Blackboard, Moodle for academic context
- **SSO** — SAML/OIDC integration with university identity provider
- **External Crisis APIs** — Direct integration with national suicide prevention lifelines

### Operational
- **Automated Backup & Disaster Recovery** — Point-in-time recovery, cross-region replication
- **Observability Stack** — Distributed tracing (Jaeger), metrics (Prometheus/Grafana), log aggregation (Loki)
- **Feature Flags** — Gradual rollouts, A/B testing framework
- **Automated Security Scanning** — SAST/DAST in CI/CD pipeline

---

## Roadmap Summary Table

| Phase | Focus | Depends On |
|---|---|---|
| 0 | Monorepo, tooling, Docker skeleton | — |
| 1 | Full database schema | 0 |
| 2 | Auth + anonymous identity | 1 |
| 3 | RBAC + app shell | 2 |
| 4 | Emotional status (with Urgency) | 1, 3 |
| 5 | Anonymous posts & replies (with Categories) | 2, 3, 4 |
| 6 | Realtime anonymous chat (auto mentor assignment) | 2, 3, 4 |
| 7 | Mentor verification, availability, features | 3, 5, 6 |
| 8 | Meetings & Workshops (online/offline) | 2, 3 |
| 9 | Resource Hub | 1 |
| 10 | Student, Mentor, Admin Dashboards | 4, 5, 6, 7, 8, 9 |
| 11 | Admin Panel (incl. resources, workshops) | 3, 7, 8, 9 |
| 12 | Realtime Notifications & Presence | 5, 6, 10 |
| 13 | Security Hardening | all prior |
| 14 | Dockerization & Deployment | all prior |
| 15 | Testing & QA | all prior |
| 16 | Final Polish & Release | all prior |

**Guiding rule for the implementing agent:** never build a feature table or endpoint that references `User.id` directly for student-generated content — always go through `AnonymousIdentity`. This single rule, enforced from Phase 1 onward, is what makes "privacy first" structural rather than a UI-layer promise.
