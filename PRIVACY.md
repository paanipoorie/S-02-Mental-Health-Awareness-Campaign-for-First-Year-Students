# Privacy-First Architecture — Anonymous Identity Separation

## How Student Anonymity Is Technically Guaranteed

This document explains the architectural safeguards that ensure student identities are never exposed to peers or mentors on the platform.

---

## 1. Database-Level Separation

### Two Identity Tables

The database contains two completely separate identity tables:

- **`User`** — Stores real credentials: `universityEmail`, `passwordHash`, `role`. Never referenced by feature tables for student content.
- **`AnonymousIdentity`** — Stores a generated display name (e.g. "Anonymous Calm Sparrow") and an avatar seed. This is the **only** identity table that feature tables reference for student-generated content.

### Strict Foreign Key Rule

Every feature table that records student activity uses `AnonymousIdentity.id` as its foreign key:

| Feature Table | Identity FK | Never References |
|---|---|---|
| `Post` | `anonymousIdentityId` | ❌ `User.id` |
| `PostReply` | `anonymousIdentityId` | ❌ `User.id` |
| `EmotionLog` | `anonymousIdentityId` | ❌ `User.id` |
| `ChatThread` | `studentIdentityId` | ❌ `User.id` |
| `ChatMessage` | `senderId` (with `senderType`) | ❌ `User.id` for students |
| `Meeting` | `hostIdentityId` (student hosts) | ❌ `User.id` for students |
| `MeetingAttendee` | `anonymousIdentityId` | ❌ `User.id` |
| `WorkshopRegistration` | `anonymousIdentityId` | ❌ `User.id` |

This is enforced both at the schema level (Prisma foreign keys) and at the service layer (query boundaries).

---

## 2. Service-Layer Enforcement

Only two services are ever allowed to join `User` ↔ `AnonymousIdentity`:

- **`AuthService`** — Resolves the logged-in user's identity for the `/api/auth/me` endpoint.
- **`IdentityService`** — Creates anonymous identities during registration and looks them up internally.

All other services (Post, Chat, Meeting, Emotion, Dashboard) operate exclusively with `AnonymousIdentity` records. They never query or join the `User` table.

---

## 3. API Response Guarantees

### What Student-Facing Endpoints Never Return

Every student-facing API endpoint is tested by an automated anonymity audit suite that asserts:

- ❌ No `universityEmail` field in response payloads
- ❌ No `passwordHash` field in response payloads
- ❌ No raw `userId` for student-derived resources
- ❌ No real student names or identifiers

### What They Return Instead

- ✅ `anonymousDisplayName` — The generated anonymous name
- ✅ `avatarSeed` — A random seed for avatar generation
- ✅ `senderName` — Resolved to `AnonymousIdentity.displayName` for student senders

### Mentor Transparency

Mentors are **not anonymous** — their real names, department, and a "Verified Mentor" badge are displayed to build trust. However:

- Students never see a mentor's email or internal `userId`
- Mentors never see a student's real identity

---

## 4. JWT & Session Privacy

- JWTs contain `userId`, `role`, and `email` but these are only used server-side for authentication
- The client receives role-appropriate profile data only:
  - **Students**: `{ role, anonymousDisplayName, avatarSeed }`
  - **Mentors**: `{ role, name, isVerifiedMentor, department }`
- Refresh tokens are stored in `httpOnly` cookies (not accessible to JavaScript)
- Access tokens are stored in memory on the client side

---

## 5. Automated Privacy Regression Suite

The file `apps/api/src/__tests__/anonymity.audit.test.ts` contains a comprehensive test suite that:

1. Registers a student and obtains a valid JWT
2. Creates posts, logs emotions, starts chats, RSVPs to meetings
3. Programmatically inspects every response payload
4. Asserts that no `universityEmail`, `passwordHash`, or raw `userId` appears in any student-facing response

This suite runs as part of `npm run test` and must pass before any release.

---

## 6. Admin Visibility

Administrators can see real identities (email, activity logs) because they need to verify mentors, manage users, and audit platform activity. All admin actions are logged in `AdminActionLog` for accountability.
