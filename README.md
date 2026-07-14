# Campus Anonymous Peer Support Platform

> **S-02: Mental Health Awareness Campaign for First-Year Students**  
> A privacy-first anonymous peer support platform connecting first-year university students with verified mentors, mental health resources, and community.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-5.x-ff5d01.svg)](https://astro.build/)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2d3748.svg)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black.svg)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

---

## 🎯 Project Overview

The transition to university life presents significant mental health challenges for first-year students — anxiety, homesickness, academic pressure, loneliness, and uncertainty — often compounded by stigma around seeking help. This platform provides a **safe, anonymous digital space** where students can:

- **Share experiences** anonymously through posts and replies
- **Connect 1:1 with verified mentors** via real-time chat
- **Join peer meetings** (study groups, discussions, mentor office hours)
- **Attend mentor-led workshops** on mental wellness topics
- **Access curated resources** (counseling centers, emergency contacts, self-help guides)
- **Track emotional state** with optional urgency levels for mentor prioritization

**Core Principle**: _Student identities are never exposed._ Every student receives a persistent anonymous identity (e.g., "Anonymous Sparrow") used across all platform features. Only the authentication layer can link anonymous identity to real identity.

---

## ✨ Features

### ✅ Completed (Phase 0 – Foundation)

- [x] Monorepo with Astro (web) + Express (api) + Shared Types
- [x] TypeScript, ESLint, Prettier, Husky configured
- [x] Tailwind CSS with Geist design system tokens
- [x] Docker Compose for local development (web, api, postgres)
- [x] Prisma ORM initialized with PostgreSQL
- [x] Health check endpoint (`GET /api/health`)
- [x] Landing page with design system showcase

### 🚧 In Progress (Phase 1 – Database Schema)

- [ ] Complete Prisma schema with all 13 core models
- [ ] Enum definitions (Role, EmotionType, MeetingType, etc.)
- [ ] Anonymous identity generator (adjective + noun word banks)
- [ ] Seed script with admin, mentors, students, sample data
- [ ] Shared types package synchronized with Prisma enums

### 📋 Planned (Phases 2–16)

| Phase | Feature                                                      | Status  |
| ----- | ------------------------------------------------------------ | ------- |
| 2     | University email auth, JWT sessions, auto anonymous identity | Planned |
| 3     | RBAC middleware, role-aware layouts, error handling          | Planned |
| 4     | Emotional status logging + urgency levels, trend aggregation | Planned |
| 5     | Anonymous posts & replies with categories, mentor badges     | Planned |
| 6     | Real-time anonymous chat (Socket.io), auto mentor assignment | Planned |
| 7     | Mentor verification, availability, priority feed             | Planned |
| 8     | Meetings & workshops (online/offline), RSVP, attendance      | Planned |
| 9     | Resource Hub (9 categories, search, filter)                  | Planned |
| 10    | Student / Mentor / Admin dashboards with aggregated widgets  | Planned |
| 11    | Admin panel: mentor verification, user mgmt, resource CRUD   | Planned |
| 12    | Real-time notifications, presence, unread badges             | Planned |
| 13    | Security hardening (rate limits, CSP, input sanitization)    | Planned |
| 14    | Production Docker, CI/CD, environment configs                | Planned |
| 15    | Testing (unit, integration, e2e), load testing               | Planned |
| 16    | Final polish, accessibility audit, documentation             | Planned |

> See [docs/phase.md](docs/phase.md) for detailed phase specifications, acceptance criteria, and implementation order.

---

## 🛠 Tech Stack

| Layer                | Technology                         | Purpose                                     |
| -------------------- | ---------------------------------- | ------------------------------------------- |
| **Frontend**         | Astro 5 + TypeScript               | Island architecture, SSR/SSG, minimal JS    |
| **Styling**          | Tailwind CSS + Geist Design System | Utility-first, design tokens, accessibility |
| **State**            | Nanostores                         | Tiny, framework-agnostic client state       |
| **Real-time**        | Socket.io Client                   | Chat, presence, notifications               |
| **Backend**          | Express + TypeScript               | REST API, layered architecture              |
| **Database**         | PostgreSQL 16                      | Relational integrity, JSON support          |
| **ORM**              | Prisma 5                           | Type-safe queries, migrations, studio       |
| **Auth**             | JWT + bcrypt                       | Stateless auth, secure password hashing     |
| **Validation**       | Zod                                | Runtime + compile-time schema validation    |
| **Real-time**        | Socket.io                          | WebSocket chat, presence, notifications     |
| **Monorepo**         | pnpm Workspaces                    | Fast, disk-efficient dependency management  |
| **Containerization** | Docker + Compose                   | Consistent local/prod environments          |
| **Design**           | Geist (Vercel)                     | Professional, accessible, minimal aesthetic |

---

## 📁 Monorepo Structure

```
campus-peer-support/
├── apps/
│   ├── web/                    # Astro Frontend
│   │   ├── src/
│   │   │   ├── pages/          # File-based routing
│   │   │   ├── layouts/        # BaseLayout, StudentLayout, MentorLayout, AdminLayout
│   │   │   ├── components/     # Feature-organized UI components
│   │   │   ├── styles/         # Global styles, Tailwind imports
│   │   │   ├── lib/            # api.ts, auth.ts, socket.ts
│   │   │   └── stores/         # Nanostores (auth, UI)
│   │   └── astro.config.mjs
│   │
│   └── api/                    # Express Backend
│       ├── src/
│       │   ├── config/         # env.ts (Zod-validated)
│       │   ├── routes/         # /api/* route registration
│       │   ├── controllers/    # Request/response handling
│       │   ├── services/       # Business logic, data access
│       │   ├── middlewares/    # auth, RBAC, validation, error, rate-limit
│       │   ├── validators/     # Zod schemas per feature
│       │   ├── utils/          # jwt, hash, logger, ApiError
│       │   ├── sockets/        # Socket.io setup, handlers
│       │   ├── prisma/         # Client, schema, seed
│       │   ├── types/          # Express Request augmentation
│       │   ├── app.ts          # Express app factory
│       │   └── server.ts       # Entry point
│       └── prisma/schema.prisma
│
├── packages/
│   └── shared-types/           # Shared TypeScript enums & DTOs
│       ├── src/enums.ts        # Role, EmotionType, UrgencyLevel, etc.
│       ├── src/entities.ts     # ApiResponse, PaginatedResponse, DTOs
│       └── package.json
│
├── docker/
│   ├── web.Dockerfile
│   ├── api.Dockerfile
│   └── docker-compose.yml
│
├── docs/
│   ├── phase.md                # 16-phase development roadmap
│   └── design.md               # Geist design system tokens
│
├── .eslintrc.cjs
├── .prettierrc
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json
├── ARCHITECTURE.md             # This file's sibling - full architecture docs
└── README.md
```

---

## 🏗 Architecture Overview

The platform follows a **privacy-first, layered architecture** with strict separation between authentication identity and anonymous identity.

```
┌─────────────┐     HTTPS/WSS      ┌─────────────┐     Prisma      ┌─────────────┐
│   Browser   │ ◄─────────────────► │  Express    │ ◄─────────────► │ PostgreSQL  │
│  (Astro)    │                     │   API       │                 │  (Prisma)   │
└─────────────┘                     └──────┬──────┘                 └─────────────┘
                                            │
                                            │ Socket.io
                                            ▼
                                     ┌─────────────┐
                                     │  Real-time  │
                                     │  (Chat,     │
                                     │   Presence,  │
                                     │   Notifs)   │
                                     └─────────────┘
```

**Key Architectural Invariants:**

1. **AnonymousIdentity Isolation** — Feature tables reference `AnonymousIdentity.id`, never `User.id`
2. **Service Layer Boundary** — Only `AuthService` and `IdentityService` may join `User ↔ AnonymousIdentity`
3. **Mentor Transparency** — Mentors use verified real names with badge; students remain anonymous
4. **Audit Trail** — All admin mutations write `AdminActionLog`

See [ARCHITECTURE.md](ARCHITECTURE.md) for comprehensive documentation including request flows, data models, folder responsibilities, technology rationale, and scalability considerations.

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js ≥ 22.12.0
- pnpm ≥ 9.0.0
- Docker & Docker Compose (for database)

### Quick Start (Docker)

```bash
# Clone and enter directory
cd campus-peer-support

# Start all services (web, api, postgres)
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

### Manual Setup (Without Docker)

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit .env files with your configuration

# Generate Prisma Client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed

# Start development servers (concurrent)
pnpm dev

# Or individually:
pnpm dev:web    # Astro on http://localhost:4321
pnpm dev:api    # Express on http://localhost:3001
```

### Environment Variables

**apps/api/.env**

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campus_peer_support
JWT_SECRET=your-super-secret-jwt-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
UNIVERSITY_EMAIL_DOMAIN=university.edu
FRONTEND_URL=http://localhost:4321
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**apps/web/.env**

```env
PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📦 Development Commands

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `pnpm dev`          | Start web + api concurrently          |
| `pnpm dev:web`      | Start Astro dev server only           |
| `pnpm dev:api`      | Start Express dev server only         |
| `pnpm build`        | Build both web and api for production |
| `pnpm build:web`    | Build Astro frontend                  |
| `pnpm build:api`    | Build Express backend                 |
| `pnpm lint`         | Run ESLint on all packages            |
| `pnpm lint:fix`     | Auto-fix ESLint issues                |
| `pnpm format`       | Format with Prettier                  |
| `pnpm format:check` | Check formatting                      |
| `pnpm db:generate`  | Generate Prisma Client                |
| `pnpm db:push`      | Push schema to DB (no migration)      |
| `pnpm db:migrate`   | Run Prisma migrations                 |
| `pnpm db:studio`    | Open Prisma Studio                    |
| `pnpm db:seed`      | Seed database with sample data        |
| `pnpm docker:up`    | Start Docker Compose services         |
| `pnpm docker:down`  | Stop Docker Compose services          |
| `pnpm docker:logs`  | Follow Docker logs                    |

---

## 🔧 Project Architecture Reference

For detailed technical documentation, see:

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Complete system architecture: request flows, data models, auth design, anonymous identity system, folder responsibilities, technology decisions, scalability
- **[docs/phase.md](docs/phase.md)** — 16-phase roadmap with detailed specifications, acceptance criteria, and implementation order
- **[docs/design.md](docs/design.md)** — Geist design system tokens (colors, typography, spacing, components)

---

## 🤝 Contributing

This project follows a phased development approach defined in [docs/phase.md](docs/phase.md). Before contributing:

1. **Read the current phase** — Each phase is a self-contained unit with explicit acceptance criteria
2. **Follow the architecture** — Respect the anonymous identity boundary; never expose `User.id` in feature APIs
3. **Run quality checks** — `pnpm lint`, `pnpm format:check`, `pnpm build` must pass
4. **Write conventional commits** — Use the commit message format specified in each phase

### Development Workflow

```bash
# 1. Create feature branch from main
git checkout -b feat/phase-X-feature-name

# 2. Implement per phase specification
# 3. Verify locally
pnpm lint && pnpm format:check && pnpm build

# 4. Commit with conventional message
git commit -m "feat(scope): description per phase spec"

# 5. Open PR for review
```

---

## 📄 License

This project is developed as part of the **CUSoC Social Challenge Initiative** for educational and non-commercial purposes.

> **Disclaimer**: This platform is a peer support tool, not a substitute for professional mental health care. For emergencies, contact local crisis services immediately.

---

## 🔗 Related Resources

- [World Health Organization - Mental Health](https://www.who.int/health-topics/mental-health)
- [NIMHANS - Student Mental Health](https://nimhans.ac.in/)
- [Geist Design System](https://vercel.com/design)
- [Astro Documentation](https://docs.astro.build)
- [Prisma Documentation](https://www.prisma.io/docs)
