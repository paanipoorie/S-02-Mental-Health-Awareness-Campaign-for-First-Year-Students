# Authentication & Onboarding Implementation Progress

## ✅ COMPLETED

### Backend API
- [x] `auth.service.ts` — `sendOTP()` and `verifyOTP()` methods with @cuchd.in validation
- [x] `email.service.ts` — no-op email sending when RESEND_API_KEY missing (dev/test)
- [x] `auth.controller.ts` — sendOTP / verifyOTP endpoints
- [x] `auth.routes.ts` — /send-otp, /verify-otp routes
- [x] `validators/auth.validator.ts` — @cuchd.in regex validation on all schemas
- [x] `admin.service.ts` — `getPendingMentors()`, `rejectMentor()` methods
- [x] `admin.controller.ts` — pending-mentors list + reject handlers
- [x] `admin.routes.ts` — `GET /mentors/pending`, `POST /mentors/:id/reject`
- [x] `dashboard.routes.ts` — mentor routes gated with `gateUnverifiedMentor`
- [x] `meeting.routes.ts` — router-level `gateUnverifiedMentor`
- [x] `dashboard.service.ts` — `pendingMentors` in AdminDashboardData
- [x] `dashboard.controller.ts` — gates mentor dashboard by verification; exposes pendingMentors
- [x] `env.ts` — `isDevelopment`, `isTest` exports; default `UNIVERSITY_EMAIL_DOMAIN=cuchd.in`

### Frontend (Web)
- [x] `lib/auth.ts` — `isUnverifiedMentor`, `MENTOR_VERIFICATION_PENDING_PATH`, `redirectUnverifiedMentor`, `requireVerifiedMentorRedirect`
- [x] `lib/api.ts` — redirect on `MENTOR_VERIFICATION_PENDING` (403), `rejectMentor` in adminApi, `AdminDashboardData.pendingMentors`
- [x] `pages/mentor/verification-pending.astro` — professional pending-verification page
- [x] `RegisterForm.tsx` — OTP flow with role selection (STUDENT/MENTOR), CU email validation
- [x] `LoginForm.tsx` — redirect unverified mentors to pending page
- [x] `AuthGuard.tsx` — redirect unverified mentors, professional pending empty state inline
- [x] `MentorDashboardClient.tsx` — redirect unverified mentors
- [x] `AdminDashboardClient.tsx` — PendingMentorRequestsWidget wired in
- [x] `PendingMentorRequestsWidget.tsx` — uses `rejectMentor` API, handles `displayName: null`

## 🔲 REMAINING

### Seed / Config
- [ ] `prisma/seed.ts` — Use @cuchd.in emails + include unverified pending mentor
- [ ] `apps/api/.env.example` — Update `UNIVERSITY_EMAIL_DOMAIN=cuchd.in`

### Navbar / Client-Side Route Guards
- [ ] `Navbar.astro` — Unverified mentor = only show pending link, restrict nav links
- [ ] Client-side guards on restricted pages: `/chat`, `/posts`, `/events`, `/meetings`, `/events/new`, `/mentor/*`
- [ ] Astro page-level guards for restricted routes

### Tests
- [ ] `__tests__/setup.ts` — Clear `emailOTP` in beforeEach; add `registerViaOTP()` helper
- [ ] `globalSetup.ts` — Set `UNIVERSITY_EMAIL_DOMAIN=cuchd.in`
- [ ] `auth.test.ts` — Rewrite with OTP flow + @cuchd.in emails
  - [ ] valid CU email
  - [ ] invalid email domains (gmail, yahoo, outlook)
  - [ ] mentor registration
  - [ ] pending mentor login
  - [ ] admin approval
  - [ ] approved mentor access
  - [ ] rejected mentor
- [ ] `anonymity.audit.test.ts` — Migrate to OTP + @cuchd.in
- [ ] `student-full-journey.test.ts` — Migrate to OTP + @cuchd.in
- [ ] `apps/web/tests/peerly.spec.ts` — Migrate Playwright E2E
- [ ] `apps/web/tests/profile.spec.ts` — Migrate Playwright E2E

### Verification
- [ ] `pnpm api lint` — passes
- [ ] `pnpm api typecheck` — passes
- [ ] `pnpm api test` — passes
- [ ] `pnpm web build` — passes
- [ ] `pnpm web test:e2e` — passes
