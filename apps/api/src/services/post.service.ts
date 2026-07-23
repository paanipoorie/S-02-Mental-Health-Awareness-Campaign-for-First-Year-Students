import { PrismaClient } from '@prisma/client';
import type {
  CreatePostInput,
  GetPostsQuery,
  CreateReplyInput,
} from '../validators/post.validator';

const prisma = new PrismaClient();

export const postService = {
  async createPost(anonymousIdentityId: string, data: CreatePostInput) {
    const post = await prisma.post.create({
      data: {
        anonymousIdentityId,
        title: data.title,
        body: data.body,
        category: data.category,
        emotion: data.emotion,
        urgencyLevel: data.urgencyLevel,
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

    return {
      posts,
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
          include: {
            anonymousIdentity: {
              select: {
                displayName: true,
                avatarSeed: true,
              },
            },
          },
        },
      },
    });

    if (post && post.isDeleted) {
      return null;
    }

    return post;
  },

  async updatePost(id: string, anonymousIdentityId: string, data: Partial<CreatePostInput>) {
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

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        body: data.body,
        emotion: data.emotion,
        urgencyLevel: data.urgencyLevel,
        category: data.category,
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
      select: { id: true, isDeleted: true },
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
      include: {
        anonymousIdentity: {
          select: {
            displayName: true,
            avatarSeed: true,
          },
        },
      },
    });

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
