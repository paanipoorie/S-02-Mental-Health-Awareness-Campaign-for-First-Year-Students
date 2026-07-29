# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-mvp] - 2026-07-29

### Added
- **Monorepo setup**: Express backend, Astro frontend, and shared types packages.
- **Database modeling**: Prisma models mapping Users, Identities, Emotions, Posts, Chat, Meetings, Workshops, Resources, and Audits.
- **Anonymous identity generator**: Automatic noun-adjective display name seeds to separate credentials from posts.
- **Urgency logs**: Student emotion logger with priority rankings (High, Medium, Low) for triage.
- **Realtime communications**: Socket.io engine supporting live messaging room assignments and online presence broadcasts.
- **Aggregated dashboards**: Custom widget cards for Students, Mentors, and Administrators.
- **Admin oversight**: Mentor verification flags, user account activation controls, and resource CRUD.
- **Security configs**: Structured Helmet security headers, CORS blocks, and route-level rate limits.

### Changed
- **Router validation**: Simplified Express route validators (`chat.routes.ts`) to use single validation middleware sheets.
- **Admin authentication**: Registered token decoding middleware on the admin router.
- **Anonymity mapping**: Mapped database joins dynamically at service bounds to yield flat names (`anonymousDisplayName`, `senderName`) for frontends.

### Fixed
- **Mentor replies**: Resolved 404 access bugs in `post.controller.ts` where unassigned mentors were blocked from replying.
- **Test parallelism**: Configured test executions sequentially to avoid database transaction collisions.
- **Test schemas**: Corrected mock inputs in `anonymity.audit.test.ts` to satisfy Zod validation constraints.

---

## [0.1.0-alpha] - 2026-07-15

### Added
- Docker Compose dev container definitions.
- Health check endpoints and schema migrations.
- Base Geist CSS styling imports.
