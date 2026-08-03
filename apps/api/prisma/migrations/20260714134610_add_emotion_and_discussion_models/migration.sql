-- CreateEnum
CREATE TYPE "EmotionType" AS ENUM ('HAPPY', 'EXCITED', 'CONFUSED', 'HOMESICK', 'LONELY', 'SCARED', 'ANXIOUS', 'BURNT_OUT', 'OVERWHELMED', 'STRESSED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "EmotionContext" AS ENUM ('POST', 'CHAT', 'STANDALONE');

-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('ACADEMICS', 'HOSTEL', 'HOMESICKNESS', 'FRIENDS', 'RELATIONSHIPS', 'TIME_MANAGEMENT', 'EXAMS', 'SLEEP', 'CLUBS', 'FINANCIAL', 'GENERAL');

-- CreateTable
CREATE TABLE "EmotionLog" (
    "id" TEXT NOT NULL,
    "anonymousIdentityId" TEXT NOT NULL,
    "emotion" "EmotionType" NOT NULL,
    "urgencyLevel" "UrgencyLevel",
    "context" "EmotionContext" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "anonymousIdentityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "PostCategory" NOT NULL,
    "emotion" "EmotionType",
    "urgencyLevel" "UrgencyLevel",
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReply" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "anonymousIdentityId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PostReply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmotionLog" ADD CONSTRAINT "EmotionLog_anonymousIdentityId_fkey" FOREIGN KEY ("anonymousIdentityId") REFERENCES "AnonymousIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_anonymousIdentityId_fkey" FOREIGN KEY ("anonymousIdentityId") REFERENCES "AnonymousIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReply" ADD CONSTRAINT "PostReply_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
