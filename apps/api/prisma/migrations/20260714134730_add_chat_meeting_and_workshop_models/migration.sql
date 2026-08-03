-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "MeetingHostType" AS ENUM ('STUDENT', 'MENTOR');

-- CreateEnum
CREATE TYPE "MeetingCategory" AS ENUM ('STUDY_GROUP', 'PEER_DISCUSSION', 'MENTOR_OFFICE_HOURS', 'SOCIAL', 'WORKSHOP', 'GENERAL');

-- CreateEnum
CREATE TYPE "WorkshopCategory" AS ENUM ('MENTAL_HEALTH', 'STRESS_MANAGEMENT', 'STUDY_SKILLS', 'TIME_MANAGEMENT', 'MINDFULNESS', 'CAREER_GUIDANCE', 'GENERAL');

-- CreateEnum
CREATE TYPE "WorkshopRegistrationStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "studentIdentityId" TEXT NOT NULL,
    "mentorId" TEXT,
    "status" "ChatStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "chatThreadId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMPTZ(6),

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hostType" "MeetingHostType" NOT NULL,
    "hostIdentityId" TEXT,
    "hostUserId" TEXT,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "time" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "meetingType" "MeetingType" NOT NULL,
    "meetingLink" TEXT,
    "location" TEXT,
    "category" "MeetingCategory" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingAttendee" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "anonymousIdentityId" TEXT NOT NULL,
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "time" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "meetingType" "MeetingType" NOT NULL,
    "meetingLink" TEXT,
    "location" TEXT,
    "category" "WorkshopCategory" NOT NULL,
    "maxAttendees" INTEGER,
    "resources" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopRegistration" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "anonymousIdentityId" TEXT NOT NULL,
    "status" "WorkshopRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendedAt" TIMESTAMPTZ(6),

    CONSTRAINT "WorkshopRegistration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_studentIdentityId_fkey" FOREIGN KEY ("studentIdentityId") REFERENCES "AnonymousIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatThreadId_fkey" FOREIGN KEY ("chatThreadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_hostIdentityId_fkey" FOREIGN KEY ("hostIdentityId") REFERENCES "AnonymousIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingAttendee" ADD CONSTRAINT "MeetingAttendee_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingAttendee" ADD CONSTRAINT "MeetingAttendee_anonymousIdentityId_fkey" FOREIGN KEY ("anonymousIdentityId") REFERENCES "AnonymousIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopRegistration" ADD CONSTRAINT "WorkshopRegistration_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopRegistration" ADD CONSTRAINT "WorkshopRegistration_anonymousIdentityId_fkey" FOREIGN KEY ("anonymousIdentityId") REFERENCES "AnonymousIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
