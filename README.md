# Peerly

### Verified, anonymous peer support for first-year university students.

Peerly is a privacy-first platform that connects new university students with **verified peer mentors**, anonymous community discussions, and curated mental-health resources — while guaranteeing that a student's real identity is never exposed to peers or mentors.

> **A note on positioning** · Peerly is an applied response to a well-documented problem. It is designed around findings from the mental-health research community and offered to campuses as a support **complement**, not a replacement, for professional care.

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-9.x-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Astro](https://img.shields.io/badge/Astro-7-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-white?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-white?style=for-the-badge&logo=socketdotio)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## Table of Contents

- [Why Peerly Exists](#why-peerly-exists)
- [Product Overview](#product-overview)
- [Core Features](#core-features)
- [Product Walkthrough](#product-walkthrough)
- [User Journey](#user-journey)
- [Role Comparison](#role-comparison)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Security & Privacy](#security--privacy)
- [Installation](#installation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [References](#references)

---

## Why Peerly Exists

Every year, hundreds of thousands of students leave their homes, families, and support networks behind to begin university. For many, this is their first time navigating life on their own — and the transition is rarely gentle.

### The transition from school to university

The move into higher education is a developmental turning point. Students are asked to build a new identity, form new relationships, and manage their own well-being, often all at once. Research consistently identifies this period as one of heightened vulnerability to emotional distress.

### Academic stress

First-year students face unfamiliar academic demands, intensified pressure to succeed, and fresh exposure to competition. Large-scale data from the WHO World Mental Health International College Student (WMH-ICS) Initiative found that **93.7% of first-year students reported at least some stress** in a major life area, with a clear dose–response relationship between stress and common mental disorders. Earlier WMH-ICS analyses also reported that roughly **one in three first-year students screened positive for at least one common anxiety, mood, or substance-use disorder**.

### Loneliness

Leaving an established support network often produces a sharp rise in isolation. Loneliness is distinct from anxiety or depression — it is the subjective feeling of being alone — yet it is deeply disruptive. It does not only affect well-being; it also impairs a student's capacity to learn and to adapt to their new environment.

### Mental-health challenges

The pressures of the first year are neither rare nor peripheral. They surface as anxiety, depression, burnout, homesickness, and difficulty adjusting. Early support matters, but campus services are frequently under-resourced and, crucially, underused.

### Students hesitate to seek help

The evidence is striking: despite high levels of distress, students often do not reach out. Low disclosure is driven by stigma, the belief that a problem is "not important enough," discomfort in asking for help, and the fear that a provider "would not understand." Even among students who acknowledged needing help, only a minority actually visited a counselling service in one Australian study.

### Why peer support works

Students show a strong natural preference for help from people like themselves rather than from formal services. Peer support capitalizes on this affinity — connecting students who share the lived experience of being a student. Reviews report that a large share of students turn to peers first, and that peer mentoring and peer-led groups have shown encouraging results for outcomes such as anxiety and stress.

### Why anonymous peer support can encourage help-seeking

Because stigma and fear of exposure are the central barriers, **anonymity is the unlock**. When a student is confident their identity is protected, the perceived social cost of reaching out drops dramatically. Anonymity lowers the "threshold to first contact," making it more likely that a struggling student raises their hand at all — and providing an on-ramp to more formal support when needed.

> These findings motivated Peerly, but Peerly does not claim to be a validated intervention. The formal evidence on peer-support effectiveness is still evolving, and several studies report mixed or non-significant results, largely because of heterogeneity in design and low participant engagement. Peerly is therefore designed as a **structured, verifiable complement** to campus services — built to improve *accessibility* and *willingness to seek help*, and to be evaluated in its own right.

### Research summary

| Research | Focus | Key Finding | Source |
| :------- | :---- | :---------- | :----- |
| Sources of stress and their associations with mental disorders among college students | Prevalence of perceived stress and its link to mental disorders in first-year students | 93.7% of first-year students report stress in at least one life area; stress shows a dose–response association with 12-month disorders | [Karyotaki et al., 2020](#references) |
| A systematic review of peer support interventions for student mental health in higher education | What peer support looks like and whether it improves student well-being | Students disclose more to peers than to institutions (75% reported telling a peer); peer mentoring and peer learning show positive results on anxiety and stress, but the evidence base is not yet solid | [Pointon-Haas et al., 2023](#references) |
| Impact of peer support on student mental well-being: a systematic review | Effectiveness of peer support for university-student well-being | Most students do not seek professional help despite recognizing a need; peer support can act as a bridge, yet current evidence is limited | [John et al., 2018](#references) |
| Loneliness among first-year university students: evaluating a peer support intervention | Effects of a peer support intervention on first-year loneliness and transition | First-year students report high initial loneliness; structured, well-engaged support is needed, as engagement remains a key challenge | [Bathelt, 2024](#references) |

---

## Product Overview

Peerly brings the well-documented benefits of peer support and anonymity into a single, campus-grade product. It is built around three promises: **students stay anonymous**, **mentors are verified**, and **every interaction sits inside a governed, moderated space**.

- **Anonymous student identity** — Every student automatically receives a persistent, human-readable anonymous identity (for example, *Anonymous Calm Falcon*). This identity is used across the entire platform, and the mapping to a real account is locked behind the authentication layer.

- **Verified peer mentors** — Mentors are campus personnel (senior students, trained peer supporters, faculty advisors) who operate under their real, professional identity, carrying a **Verified Mentor** badge so their guidance is trusted.

- **University email verification** — Registration is gated to the institution's email domain. Each new account is confirmed through a one-time passcode delivered by email, so the community is authentic and exclusive to verified students and staff.

- **Private mentoring** — Students and mentors connect in real-time, one-to-one chats with read receipts and typing indicators, routed automatically to available mentors.

- **Anonymous discussions** — A category-based forum where students share experiences, vent, and ask questions without exposing who they are. Mentor replies are badged for credibility; student replies stay fully anonymous.

- **Peer meetings & workshops** — Students RSVP to peer meetings (study circles, office hours, discussion groups) and register for mentor-led mental-wellness workshops, in person or online.

- **Resource Hub** — A living library of counseling-center details, crisis and emergency contacts, self-help guides, and campus welfare listings, curated by administrators.

- **Role-based dashboards** — Students, mentors, and administrators each get their own analytics-driven workspace tailored to what they need and what they may do.

- **Admin moderation** — Administrators verify mentors, manage accounts, oversee events and workshops, curate resources, and keep an audited record of every administrative action.

---

## Core Features

| Feature | Description | Benefit |
| :------ | :---------- | :------ |
| Anonymous Identity | Auto-generated, persistent display name and avatar per student | Students can ask for help with zero social risk |
| Email OTP Verification | One-time passcode to confirm a university-domain account | Authentic, exclusive community of real students and staff |
| JWT Session Management | Short-lived access tokens with rotating refresh tokens | Secure, stateless authentication that resists XSS and CSRF |
| Emotion Logging | Students log their current emotion with an optional urgency level | Early visibility of at-risk students for mentors |
| Mentor Priority Feed | Surfaces high-urgency anonymous posts to mentors first | Critical cases reach support first |
| Anonymous Forums | Category-based posts and replies with soft delete | A safe, searchable space to share and be heard |
| Real-time Private Chat | Socket.io chat with typing and read receipts | Immediate, private access to a verified mentor |
| Peer Meetings & Workshops | RSVP and registration with online/offline modes | Structured community and skill-building opportunities |
| Resource Hub | Curated counseling and crisis reference library | Always-available self-help and escalation paths |
| Role Dashboards | Analytics widgets for student, mentor, and admin | Role-tailored clarity and operational oversight |
| Admin Moderation | Verification, account management, audit logging | A governed, safe community with accountability |

---

## Product Walkthrough

Screenshots live in [`media/screenshots/`](media/screenshots/). The product flows from a calm, welcoming entry to fully role-aware workspaces.

### 1. Landing — *first impressions*

The landing page introduces Peerly's core promise — safe, anonymous support — with clear calls to action. It explains the offering in a few focused sections and brings the brand's low-pressure tone forward.

![Hero](media/screenshots/Hero.png)

**What you can do here**

- Learn what Peerly is and why anonymity matters.
- Navigate to **Sign up** or **Sign in**.
- Read the platform's privacy stance before committing.

### 2. Email verification — *proving you belong*

Registration requires an institution email. Peerly sends a one-time passcode to that address, which must be entered before an account is created — keeping the community authentic and exclusive to your campus.

![Email verification](media/screenshots/mailvalidation.png)

**What you can do here**

- Submit a university email address.
- Receive and enter a six-digit verification code.
- Complete onboarding knowing only real students and staff are inside.

### 3. Sign in — *authenticated entry*

Returning users sign in with their university email and password. The session is issued as a JWT — brief and refreshed automatically — so access is both convenient and secure.

![Sign in](media/screenshots/signin.png)

**What you can do here**

- Authenticate with your campus credentials.
- Restore your session securely on a new device or browser.

### 4. Student dashboard — *a supportive home base*

After signing in, students land on a dashboard showing their logged emotion, active chats, the latest discussions, upcoming meetings and workshops, and quick-access resources.

![Student dashboard](media/screenshots/studentdashboard.png)

**What you can do here**

- Log your current emotion with an optional urgency level.
- See a snapshot of your chats and recent posts.
- Discover upcoming events and relevant resources at a glance.

### 5. Discussions — *an anonymous community*

The forum lets students post under their anonymous identity, tagged by category and, optionally, by emotion and urgency. Replies from mentors are badged **Verified Mentor**; replies from students stay anonymous.

![Discussions](media/screenshots/posts.png)

**What you can do here**

- Start an anonymous post in categories like Academics, Hostel, Homesickness, or Relationships.
- Reply to others or soft-delete your own contributions.
- Identify credible mentor guidance by its badge.

### 6. Chats — *private, real-time support*

Students message their assigned mentor in a private thread with live delivery, read receipts, and typing indicators. The student's identity remains anonymous throughout.

![Private chat](media/screenshots/chats.png)

**What you can do here**

- View your conversation inbox.
- Open a thread and converse in real time with a mentor.
- Track which messages have been read.

### 7. Events — *meetings & workshops*

Peer meetings (study groups, office hours, discussion circles) and mentor-led workshops are listed with dates, times, mode (online or offline), and capacity. Students RSVP or register with one click.

![Events](media/screenshots/events.png)

**What you can do here**

- Browse upcoming meetings and workshops.
- RSVP to peer meetings and register for workshops.
- See event details such as location, link, and resources.

### 8. Mentor dashboard — *empowering the support team*

Mentors see their assigned students, waitlist of chats, priority matters, and availability controls. High-urgency posts are surfaced ahead of routine ones so mentors can act first where it matters most.

![Mentor dashboard](media/screenshots/mentordashboard.png)

**What you can do here**

- Review your assigned students and incoming chats.
- Toggle availability (*Available*, *Busy*, *Offline*) to control intake.
- Work through the priority feed of high-urgency posts.

### 9. Admin portal — *governance and oversight*

Administrators monitor platform health, verify mentors, manage accounts and events, curate the Resource Hub, and keep an audited record of every change they make.

![Admin portal](media/screenshots/adminportal.png)

**What you can do here**

- Verify or revoke mentor status.
- Activate or block user accounts.
- Oversee meetings, workshops, and counseling resources.
- Review the audit trail of administrative actions.

---

## User Journey

The end-to-end student experience, from first visit to sustained support.

```mermaid
flowchart TD
    A[Landing page] --> B[Registration]
    B --> C[Email Verification]
    C --> D[Authentication]
    D --> E[Anonymous Identity Assigned]
    E --> F[Role-aware Dashboard]
    F --> G[Anonymous Discussions]
    G --> H[Mentor Assignment]
    H --> I[Private Chat]
    I --> J[Events & Workshops]
    J --> K[Resource Hub & Ongoing Support]

    style A fill:#f5f5f4,stroke:#111,color:#111
    style E fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
    style K fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
```

---

## Role Comparison

Three roles share one codebase, each with distinct capabilities and responsibilities.

| | **Student** | **Mentor** | **Admin** |
| :--- | :--- | :--- | :--- |
| **Identity** | Anonymous (persistent display name + avatar) | Real identity with Verified Mentor badge | Real identity |
| **Primary surface** | `/dashboard`, `/posts`, `/chat`, `/events` | `/mentor/dashboard`, `/mentor/priority-feed` | `/admin/*` |
| **Posts** | Create, reply, soft-delete own content | Reply with verified badge | Moderate / remove |
| **Chat** | 1:1 with assigned mentor | 1:1 with assigned students | — |
| **Events & workshops** | RSVP & register | Host workshops / peer meetings | Oversee & cancel |
| **Resources** | Browse | — | Full CRUD |
| **Verification** | Email OTP on sign-up | `isVerifiedMentor` toggled by admin | Granted by seeding |
| **Protection** | Identity never exposed | Gated until verified | Full access |
| **Accountability** | — | — | Audit trail on every action |

---

## Architecture

Peerly is a layered, privacy-first system built as a pnpm monorepo. The client (Astro) talks to the backend (Express) over HTTPS, and to a Socket.io service for real-time features; the backend owns all business logic and persistence through Prisma and PostgreSQL.

### High-level architecture

```mermaid
flowchart LR
    subgraph Client
        W[Astro Frontend]
        S[Socket.io Client]
    end
    subgraph Backend
        API[Express REST API]
        IO[Socket.io Server]
        SRV[Service Layer]
        ORM[Prisma ORM]
    end
    subgraph Data
        PG[PostgreSQL]
    end

    W -- HTTPS/JWT --> API
    S -- WebSocket --> IO
    API --> SRV
    IO --> SRV
    SRV --> ORM
    ORM --> PG
```

### Authentication flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Astro (web)
    participant A as Express API
    participant P as Prisma/Postgres

    U->>W: Register with university email
    W->>A: POST /api/auth/register
    A->>P: Check domain & create user
    A->>U: Send OTP via email
    U->>A: Submit OTP
    A->>P: Verify & activate account
    U->>W: Sign in (email + password)
    W->>A: POST /api/auth/login
    A->>P: Verify bcrypt hash
    A->>W: Issue access (15m) + refresh (7d) tokens
    W->>A: Authorized requests with Bearer token
```

### Anonymous identity flow

```mermaid
flowchart TD
    A[Student registers] --> B{Create User}
    B --> C[Generate Anonymous Identity<br/>adjective + noun + avatar seed]
    C --> D[Feature tables reference<br/>AnonymousIdentity.id only]
    D --> E[Auth service is sole bridge<br/>User <-> AnonymousIdentity]
    E --> F[Student payloads never expose<br/>email or database ID]

    style D fill:#fef3c7,stroke:#b45309,color:#78350f
    style F fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
```

### Chat architecture

```mermaid
sequenceDiagram
    participant C as Student (Socket.io)
    participant IO as Socket.io Server
    participant S as Chat Service
    participant P as Prisma/Postgres

    C->>IO: connect(auth: { token })
    IO->>IO: Verify JWT handshake
    C->>IO: chat:join { threadId }
    IO->>IO: Authorization: participant check
    C->>IO: chat:message { body }
    IO->>S: Persist message
    S->>P: Save ChatMessage
    IO-->>C: chat:message (broadcast)
    IO-->>C: notification:new (when offline)
```

### Role interactions

```mermaid
flowchart LR
    ST[Student<br/>anonymous] -- "post / reply / RSVP" --> FO[Forums & Events]
    ST -- "1:1 private chat" --> ME[Mentor]
    ME -- "verified badge / guidance" --> ST
    ME -- "priority feed" --> AD[Admin Dashboard]
    AD -- "verify / block / curate" --> ME
    AD -- "audit log" --> LG[AdminActionLog]

    style ST fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
    style ME fill:#dcfce7,stroke:#15803d,color:#14532d
    style AD fill:#fae8ff,stroke:#a21caf,color:#701a75
```

### Backend architecture

```mermaid
flowchart TD
    R[Routes] --> CT[Controllers]
    CT --> SRV[Services]
    SRV --> ORM[Prisma]
    ORM --> PG[(PostgreSQL)]

    MW[Middlewares<br/>auth · rate-limit · validate · error] --> R
    Z[Zod Validators] --> MW
    SK[Socket.io<br/>chat · presence · notifications] --> SRV
    UT[Utils<br/>jwt · hash · anonymousIdentity] --> SRV

    style PG fill:#fef3c7,stroke:#b45309,color:#78350f
    style SRV fill:#e0e7ff,stroke:#4338ca,color:#312e81
```

---

## Technology Stack

| Layer | Technology | Purpose |
| :---- | :--------- | :------ |
| **Frontend** | Astro 7 · React 19 islands | SSR/SSG pages with interactive widgets |
| **Styling** | Tailwind CSS 4 · Geist design system | Minimal, professional, responsive UI |
| **State** | Nanostores | Lightweight client-side session and UI state |
| **Backend** | Express 4 · TypeScript · Node 22 | Layered REST API with validation |
| **Database** | PostgreSQL 16 · Prisma ORM | Relational schema, migrations, type-safe queries |
| **Real-time** | Socket.io 4 | Private chat, presence, notifications |
| **Authentication** | JWT (access + refresh) · bcrypt · Zod | Stateless, secure, validated sessions |
| **Email / OTP** | Resend | One-time-passcode delivery on registration |
| **Infrastructure** | Docker · Docker Compose · PostgreSQL 16 Alpine | Reproducible local & production deployment |
| **Deployment** | Vercel (web) · Node service (api) | Serverless SSR and containerized API |
| **Developer Tools** | pnpm workspaces · ESLint · Prettier · Husky | Consistent, gated codebase |
| **Testing** | Vitest · Supertest · Playwright | 71+ integration tests and full E2E journeys |

---

## Project Structure

Peerly is organized as a pnpm monorepo with strict separation between the web client, the API, and shared contracts.

```
peerly/
├── apps/
│   ├── web/                  # Astro frontend (pages, layouts, astro islands)
│   │   └── src/
│   │       ├── pages/        # File-based routing (/dashboard, /posts, /chat, /mentor, /admin)
│   │       ├── layouts/      # Base / Student / Mentor / Admin shells
│   │       ├── components/   # Feature orgs: auth, chat, posts, dashboard, ui
│   │       ├── lib/          # API client, auth helpers, Socket.io client
│   │       ├── stores/       # Nanostores (authStore, UI state)
│   │       └── styles/       # Global styles and Geist tokens
│   └── api/                  # Express backend (routes, controllers, services)
│       ├── src/
│       │   ├── routes/       # HTTP route definitions
│       │   ├── controllers/  # Request/response handling
│       │   ├── services/     # Business logic and data access
│       │   ├── middlewares/  # auth · rate-limit · validate · error
│       │   ├── validators/   # Zod request schemas
│       │   ├── sockets/      # Socket.io chat, presence, notifications
│       │   ├── utils/        # jwt, hash, anonymousIdentity
│       │   └── prisma/       # Prisma client
│       └── prisma/           # schema.prisma, migrations, seed
├── packages/
│   └── shared-types/         # Shared enums & DTOs (single source of truth)
├── docker/                   # api & web Dockerfiles, docker-compose.yml
├── docs/                     # INSTALLATION, USER_GUIDE, API, DATABASE
├── media/                    # Product screenshots and campaign assets
├── LICENSE                   # MIT
└── README.md
```

---

## Security & Privacy

Peerly treats anonymity as a structural guarantee, not a feature flag.

- **Anonymous identities** — Students are identified only by a generated human-readable name and avatar seed. Feature tables reference `AnonymousIdentity.id`; the mapping to a real `User` is available exclusively to the auth layer.

- **JWT authentication** — Stateless sessions using short-lived access tokens (15 minutes) passed in the `Authorization` header, paired with rotating refresh tokens (7 days) held in a secure `httpOnly`, `sameSite: 'lax'` cookie.

- **Password hashing** — Passwords are hashed with bcrypt at 12 salt rounds before ever touching the database.

- **OTP verification** — Accounts are gated by a one-time passcode sent to the verified university-domain email before activation.

- **Mentor verification** — Mentor accounts start unverified; the `isVerifiedMentor` flag is granted only by an administrator, and `requireVerifiedMentor` blocks all mentor actions until then.

- **Role-based authorization** — Every protected route is guarded by role assertions (`requireRole`) so students, mentors, and administrators can only reach what they are allowed to.

- **Rate limiting** — Per-route rate limits (`express-rate-limit`) dampen abuse and brute-force attempts across sensitive endpoints.

- **Input validation** — Every request is validated against a Zod schema at the middleware boundary before reaching business logic.

- **PII protection** — A dedicated test suite programmatically asserts that student-facing payloads never return university email addresses or raw database IDs.

- **Moderation** — Soft deletes, administrator moderation, and a permanent `AdminActionLog` keep content safe and actions accountable.

---

## Installation

Peerly runs locally with minimal setup.

### Requirements

- **Node.js** 22.12 or higher
- **pnpm** 9 or higher
- **Docker** & Docker Compose (for the local database)

### Clone

```bash
git clone <repository-url>
cd peerly
```

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Copy the example configs into real `.env` files and update secrets.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Key values in `apps/api/.env`:

```ini
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/campus_peer_support?schema=public"
JWT_SECRET="replace-with-a-long-random-string"
JWT_REFRESH_SECRET="replace-with-a-long-random-string"
BCRYPT_SALT_ROUNDS=12
UNIVERSITY_EMAIL_DOMAIN=cuchd.in
FRONTEND_URL=http://localhost:4321
```

Key values in `apps/web/.env`:

```ini
NODE_ENV=development
PORT=4321
PUBLIC_API_URL=http://localhost:3001/api
```

### Run locally (step by step)

```bash
pnpm docker:up      # start PostgreSQL 16
pnpm db:migrate     # apply Prisma migrations
pnpm db:seed        # seed demo users, mentors, and content
pnpm dev            # run web + api together
```

- Frontend → <http://localhost:4321>
- Backend API → <http://localhost:3001>

### One-shot demo

`pnpm demo` starts PostgreSQL, syncs the schema, seeds demo accounts, boots both dev servers, and prints all the relevant links. Use `--no-seed` to skip reseeding and `--no-db` if a database is already running.

### Docker

For a fully containerized build of web, API, and database:

```bash
docker compose -f docker/docker-compose.yml up -d
```

Each service includes health checks and ordered startup (database → API → web), matching production topology locally.

---

## Roadmap

| | Status |
| :-- | :-- |
| **Completed** | &nbsp; |
| Monorepo scaffolding (Astro + Express) | Done |
| Core database schema (15 tables) & seeding | Done |
| Auth, OTP email verification, anonymous identities | Done |
| Role-based access control & responsive dashboards | Done |
| Emotional logging with urgency triage | Done |
| Anonymous forums & verified mentor replies | Done |
| Real-time private chat (typing, read receipts) | Done |
| Peer meetings & workshops (online/offline) | Done |
| Resource Hub & administrator CRUD | Done |
| Admin moderation & audit logging | Done |
| Security hardening & 71-test integration suite | Done |
| Production Docker Compose & Vercel deployment | Done |
| **In Progress** | &nbsp; |
| Structured evaluation of support outcomes | In progress |
| Engagement design to combat low peer-support uptake | In progress |
| **Future** | &nbsp; |
| SSO / OIDC with university identity providers | Planned |
| Multi-factor authentication for mentors & admins | Planned |
| Crisis-escalation button & group peer circles | Planned |
| AI-assisted content moderation & sentiment analysis | Planned |
| Mobile wrapper (React Native / Expo) with push | Planned |

---

## Contributing

Contributions are welcome. Peerly's most important rule is its privacy guarantee, so please keep it in mind.

1. **Fork** the repository.
2. **Branch** — create a feature branch (`git checkout -b feature/your-feature`).
3. **Commit** — write clear, conventional commit messages.
4. **Push** — push to your branch (`git push origin feature/your-feature`).
5. **Open a PR** — describe your change and why it matters.

Guidelines:

- Never bypass privacy rules — feature APIs must not join the `User` schema directly.
- Run tests sequentially before opening a PR:

```bash
pnpm --filter api test -- --fileParallelism=false --maxWorkers=1
```

- Match the surrounding code style and conventional commit format.

---

## License

Peerly is released under the [MIT License](LICENSE).

> **Disclaimer** · Peerly is a peer-support platform and a complementary mental-health resource. It is not a substitute for professional mental-health care. If you or someone you know is in crisis, contact a licensed professional or an emergency service immediately.

---

## Acknowledgements

Peerly stands on the shoulders of the communities that make timely, accessible student support possible.

- **The mental-health research community**, whose rigorous studies — including those cited below — clarify why first-year students struggle and how best to reach them.
- **The WHO World Mental Health International College Student (WMH-ICS) Initiative**, for building the cross-national evidence base on student distress and stress.
- **The open-source ecosystem**, including Astro, Express, Prisma, Socket.io, React, and Tailwind CSS, without which a privacy-first product of this scope would be far harder to build.
- **The Chandigarh University community**, whose support, feedback, and collaboration shaped Peerly into what it is today.

---

## References

1. Karyotaki, E., Cuijpers, P., Albor, Y., Alonso, J., Auerbach, R. P., Bantjes, J., et al. (2020). **Sources of Stress and Their Associations With Mental Disorders Among College Students: Results of the World Health Organization World Mental Health Surveys International College Student Initiative.** *Frontiers in Psychology, 11*, 1759. <https://doi.org/10.3389/fpsyg.2020.01759>

2. Pointon-Haas, J., Waqar, L., Upsher, R., Foster, J., Byrom, N., & Oates, J. (2023). **A systematic review of peer support interventions for student mental health and well-being in higher education.** *BJPsych Open, 10*(1), e12. <https://pmc.ncbi.nlm.nih.gov/articles/PMC10755562/>

3. John, N. M., Page, O., Martin, S. C., & Whittaker, P. (2018). **Impact of peer support on student mental wellbeing: a systematic review.** *MedEdPublish, 7*, 170. <https://pmc.ncbi.nlm.nih.gov/articles/PMC10701817/>

4. Bathelt, J. (2024). **Loneliness among First-Year University Students: Evaluating a Peer Support Intervention.** *Psychology Teaching Review, 30*(2), 7–16. <https://files.eric.ed.gov/fulltext/EJ1447470.pdf>