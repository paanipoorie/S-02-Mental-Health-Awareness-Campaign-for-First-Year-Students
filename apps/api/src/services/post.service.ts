import { PrismaClient } from '@prisma/client';
import type {
  CreatePostInput,
  UpdatePostInput,
  GetPostsQuery,
  CreateReplyInput,
} from '../validators/post.validator.js';
import { emitNotification } from './notificationHelper.js';

const prisma = new PrismaClient();

export const postService = {
  async createPost(anonymousIdentityId: string, data: CreatePostInput) {
    const post = await prisma.post.create({
      data: {
        anonymousIdentityId,
        title: data.title,
        body: data.body,
        category: data.category,
        emotion: data.emotion ?? null,
        urgencyLevel: data.urgencyLevel ?? null,
      },
      include: {
        anonymousIdentity: {
          select: {
            displayName: true,
            avatarSeed: true,
          },
        },
      },
    });

    return post;
  },

  async getPosts(query: GetPostsQuery) {
    const { page, limit, emotion, category } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isDeleted: false,
    };

    if (emotion) {
      where.emotion = emotion;
    }

    if (category) {
      where.category = category;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          anonymousIdentity: {
            select: {
              displayName: true,
              avatarSeed: true,
            },
          },
          _count: {
            select: { replies: { where: { isDeleted: false } } },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const mappedPosts = posts.map(p => ({
      ...p,
      anonymousDisplayName: p.anonymousIdentity?.displayName,
    }));

    return {
      posts: mappedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  },

  async getPostById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        anonymousIdentity: {
          select: {
            displayName: true,
            avatarSeed: true,
          },
        },
        replies: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (post && post.isDeleted) {
      return null;
    }

    if (!post) {
      return null;
    }

    const repliesWithAuthor = await Promise.all(
      post.replies.map(async (reply) => {
        const anon = await prisma.anonymousIdentity.findUnique({
          where: { id: reply.anonymousIdentityId },
          select: { displayName: true },
        });

        if (anon) {
          return {
            id: reply.id,
            postId: reply.postId,
            body: reply.body,
            createdAt: reply.createdAt,
            isDeleted: reply.isDeleted,
            authorName: anon.displayName,
            isMentor: false,
          };
        }

        const user = await prisma.user.findUnique({
          where: { id: reply.anonymousIdentityId },
          select: { role: true, isVerifiedMentor: true },
        });

        return {
          id: reply.id,
          postId: reply.postId,
          body: reply.body,
          createdAt: reply.createdAt,
          isDeleted: reply.isDeleted,
          authorName: user?.role === 'ADMIN' ? 'Administrator' : 'Peer Mentor',
          isMentor: user?.role === 'MENTOR' ? user.isVerifiedMentor : false,
        };
      })
    );

    return {
      ...post,
      anonymousDisplayName: post.anonymousIdentity?.displayName,
      replies: repliesWithAuthor,
    };
  },

  async updatePost(id: string, anonymousIdentityId: string, data: UpdatePostInput) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { anonymousIdentityId: true, isDeleted: true },
    });

    if (!post || post.isDeleted) {
      return null;
    }

    if (post.anonymousIdentityId !== anonymousIdentityId) {
      throw new Error('FORBIDDEN');
    }

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.emotion !== undefined) updateData.emotion = data.emotion ?? null;
    if (data.urgencyLevel !== undefined) updateData.urgencyLevel = data.urgencyLevel ?? null;
    if (data.category !== undefined) updateData.category = data.category;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        anonymousIdentity: {
          select: {
            displayName: true,
            avatarSeed: true,
          },
        },
      },
    });

    return updatedPost;
  },

  async deletePost(id: string, anonymousIdentityId: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { anonymousIdentityId: true, isDeleted: true },
    });

    if (!post || post.isDeleted) {
      return false;
    }

    if (post.anonymousIdentityId !== anonymousIdentityId) {
      throw new Error('FORBIDDEN');
    }

    await prisma.post.update({
      where: { id },
      data: { isDeleted: true },
    });

    return true;
  },

  async createReply(postId: string, anonymousIdentityId: string, data: CreateReplyInput) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        isDeleted: true,
        title: true,
        anonymousIdentityId: true,
        anonymousIdentity: {
          select: { userId: true, displayName: true },
        },
      },
    });

    if (!post || post.isDeleted) {
      throw new Error('POST_NOT_FOUND');
    }

    const reply = await prisma.postReply.create({
      data: {
        postId,
        anonymousIdentityId,
        body: data.body,
      },
    });

    // Send notification to post author (if replier is not the author)
    if (post.anonymousIdentityId !== anonymousIdentityId && post.anonymousIdentity.userId) {
      const replier = await prisma.anonymousIdentity.findUnique({
        where: { id: anonymousIdentityId },
        select: { displayName: true },
      });
      const replySnippet = data.body.length > 100 ? data.body.slice(0, 100) + '...' : data.body;
      await emitNotification(
        post.anonymousIdentity.userId,
        'NEW_REPLY',
        'New Reply on Your Post',
        `${replier?.displayName || 'Someone'} replied to "${post.title}": "${replySnippet}"`,
        { postId, replyId: reply.id }
      );
    }

    return reply;
  },

  async deleteReply(postId: string, replyId: string, anonymousIdentityId: string) {
    const reply = await prisma.postReply.findUnique({
      where: { id: replyId },
      select: { postId: true, anonymousIdentityId: true, isDeleted: true },
    });

    if (!reply || reply.isDeleted || reply.postId !== postId) {
      return false;
    }

    if (reply.anonymousIdentityId !== anonymousIdentityId) {
      throw new Error('FORBIDDEN');
    }

    await prisma.postReply.update({
      where: { id: replyId },
      data: { isDeleted: true },
    });

    return true;
  },
};
