import { prisma } from '../prisma/client.js';

export const profileService = {
  async getAnonymousProfile(anonymousIdentityId: string) {
    const identity = await prisma.anonymousIdentity.findUnique({
      where: { id: anonymousIdentityId },
      include: {
        posts: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            category: true,
            emotion: true,
            urgencyLevel: true,
            createdAt: true,
            replies: {
              where: { isDeleted: false },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!identity) {
      return null;
    }

    // Count replies authored by this identity
    const replyCount = await prisma.postReply.count({
      where: {
        anonymousIdentityId,
        isDeleted: false
      }
    });

    // Count unique discussions participated in (created by them OR replied to by them)
    const repliedPosts = await prisma.postReply.findMany({
      where: {
        anonymousIdentityId,
        isDeleted: false
      },
      select: {
        postId: true
      },
      distinct: ['postId']
    });

    const userCreatedPostIds = identity.posts.map(p => p.id);
    const uniqueRepliedPostIds = repliedPosts.map(r => r.postId);
    const uniqueDiscussionIds = new Set([...userCreatedPostIds, ...uniqueRepliedPostIds]);
    const discussionsParticipatedCount = uniqueDiscussionIds.size;

    const recentPosts = identity.posts.map(post => ({
      id: post.id,
      title: post.title,
      category: post.category,
      emotion: post.emotion,
      urgencyLevel: post.urgencyLevel,
      createdAt: post.createdAt,
      replyCount: post.replies.length
    }));

    return {
      anonymousId: identity.id,
      displayName: identity.displayName,
      joinedAt: identity.createdAt,
      avatarSeed: identity.avatarSeed,
      postCount: identity.posts.length,
      replyCount,
      discussionsParticipatedCount,
      recentPosts
    };
  }
};
