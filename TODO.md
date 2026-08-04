# Fix Task Checklist

## 1. Fix Admin Event Detail 404 (HIGH PRIORITY) — ✅ COMPLETE
- [x] Fixed `EventsOverviewWidget.tsx` — `/events/${id}?type=` → `/events?id=${id}&type=`
- [x] Verified all other event links use canonical `?id=` pattern (UpcomingMeetingsWidget, UpcomingWorkshopsWidget, TodaysMeetingsWidget, TodaysWorkshopsWidget, notifications)
- [x] Verified Admin Meeting/Workshop tables use `/meetings/[id]` / `/workshops/[id]` which redirect correctly
- [x] Verified meeting/workshop API route access for ADMIN role (meeting.routes.ts allows ADMIN)

Root cause: Admin tables linked to `/meetings/${id}` which `/meetings/[id].astro` redirects to `/events?id=${id}&type=meeting`. The EventListClient reads `?id` & `?type` from the URL to mount MeetingDetailClient/WorkshopDetailClient — same single detail page for all 3 roles. No separate admin page created.

## 2. Backend: Unified Anonymous Identity Service for Mentors — ✅ COMPLETE
- [x] Enhanced `apps/api/src/utils/anonymousIdentity.ts` `getMentorIdentity` — stable orderBy `createdAt asc, id asc` + deterministic hash fallback for missing user row
- [x] Fixed `chat.service.ts` — replaced `'Unknown'` name fallbacks with `getMentorIdentity` (mentor branches) and student `displayName`
- [x] Fixed `post.service.ts` — replaced `'Peer Mentor'`, `'Administrator'` fallbacks with `getMentorIdentity`
- [x] Fixed `dashboard.service.ts` — replaced `'Assigned Mentor'`, `'Unknown Mentor'`, generic `'Mentor'` with `getMentorIdentity`
- [x] Fixed `admin.service.ts` — meeting/workshop host/mentor display names via `getMentorIdentity` (removed email leaks)
- [x] Fixed `mentor.service.ts` — mentor profile & list display via `getMentorIdentity`
- [x] Fixed `meeting.service.ts` — mentor display names via `getMentorIdentity` (verified)

## 3. Frontend: Consume Unified Identity — ✅ COMPLETE
- [x] Fixed `ChatList.tsx` — uses `otherDisplayName`/`mentorDisplayName` from API
- [x] Fixed `ChatWindow.tsx` — removed `'Anonymous'`/`'Unknown'` defaults; uses API `mentorDisplayName`; fallback only if empty
- [x] `MessageBubble.tsx` — displays `senderName` from API (verified)
- [x] `MeetingDetailClient.tsx` — `'Anonymous'` fallback kept only for possible student-host case (API returns proper names otherwise)
- [x] `WorkshopDetailClient.tsx` — `'Anonymous'` fallback kept only for possible mentor name case
- [x] `EventListClient.tsx` — `'Anonymous'` host fallback kept only for possible student-host case
- [x] `MeetingListClient.tsx` — `'Anonymous'` fallback kept only for possible student-host case
- [x] `AdminMeetingTable.tsx`/`.astro` — removed `'Unknown'` fallback → `hostDisplayName || hostType`
- [x] `PendingMentorRequestsWidget.tsx` — removed `'Unknown Name'` fallback
- [x] `UserTable.astro` — `'Anonymous'` fallback only for students (anonymous display name)

## 4. Navbar/Layout Text — ✅ COMPLETE
- [x] Fixed `MentorLayout.astro` — default `mentorName='Peer Mentor'` → empty, conditionally rendered
- [x] Fixed `mentor/dashboard.astro` — removed hardcoded `mentorName="Peer Mentor"`
- [x] Fixed `dashboard.astro` — removed hardcoded `anonymousDisplayName="Anonymous Student"` (dead prop; `StudentLayout` doesn't accept it)
- [x] Verified `RoleBadge.astro` — role badges are role labels, not identities (okay)

## 5. Notifications — ✅ COMPLETE
- [x] Verified notification texts use display names (chat.service.ts emitNotification calls use student/mx mentor identity correctly)
- [x] `'New Message from Mentor'` kept as a title label (not an identity name) — correct

## 6. Tests & Verification — ✅ COMPLETE
- [x] Updated `anonymity.audit.test.ts` regex — student format is `[A-Z][a-z]+ [A-Z][a-z]+` (e.g. "Gentle Butterfly"), NOT `Anonymous X Y`
- [x] Updated `auth.test.ts` and `unit/identity.service.test.ts` same regex fix
- [x] Ran API tests — **74 passed / 12 files** ✅
- [x] Web identity fallback audit — no `Unknown`/`Unknown Mentor`/`Assigned Mentor`/`Anonymous Mentor` remain

