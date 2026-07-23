import { PrismaClient, PostCategory, EmotionType, UrgencyLevel } from '@prisma/client';
import type { CreatePostInput, UpdatePostInput, CreateReplyInput, GetPostsQuery, GetPostParams, DeleteReplyParams } from '../validators/post.validator';

const prisma = new PrismaClient();

const POST_SELECT = {
  id: true,
  title: true,
  body: true,
  category: true,
  emotion: true,
  urgencyLevel: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  anonymousIdentity: {
    select: {
      id: true,
      displayName: true,
      avatarSeed: true,
    },
  },
  _count: {
    select: { replies: { where: { isDeleted: false } } },
  },
} as const;

const REPLY_SELECT = {
  id: true,
  body: true,
  createdAt: true,
  isDeleted: true,
  anonymousIdentity: {
    select: {
      id: true,
      displayName: true,
      avatarSeed: true,
    },
  },
  post: {
    select: {
      id: true,
      anonymousIdentityId: true,
    },
  },
} as const;

export const postService = {
  async createPost(anonymousIdentityId: string, data: CreatePostInput) {
    const { title, body, category, emotion, urgencyLevel } = data;

    const post = await prisma.post.create({
      data: {
        anonymousIdentityId,
        title,
        body,
        category,
        emotion,
        urgencyLevel,
      },
      select: POST_SELECT,
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
        select: POST_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
    const post = await prisma.post.findFirst({
      where: { id, isDeleted: false },
      select: {
        ...POST_SELECT,
        replies: {
          where: { isDeleted: false },
          select: REPLY_SELECT,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return post;
  },

  async updatePost(id: string, anonymousIdentityId: string, data: UpdatePostInput) {
    const post = await prisma.post.findFirst({
      where: { id, isDeleted: false },
      select: { anonymousIdentityId: true },
    });

    if (!post) {
      return null;
    }

    if (post.anonymousIdentityId !== anonymousIdentityId) {
      throw new Error('FORBIDDEN');
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data,
      select: POST_SELECT,
    });

    return updatedPost;
  },

  async deletePost(id: string, anonymousIdentityId: string) {
    const post = await prisma.post.findFirst({
      where: { id, isDeleted: false },
      select: { anonymousIdentityId: true },
    });

    if (!post) {
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
    const post = await prisma.post.findFirst({
      where: { id: postId, isDeleted: false },
      select: { id: true },
    });

    if (!post) {
      throw new Error('POST_NOT_FOUND');
    }

    const reply = await prisma.postReply.create({
      data: {
        postId,
        anonymousIdentityId,
        body: data.body,
      },
      select: REPLY_SELECT,
    });

    return reply;
  },

  async deleteReply(postId: string, replyId: string, anonymousIdentityId: string) {
    const reply = await prisma.postReply.findFirst({
      where: { id: replyId, postId, isDeleted: false },
      select: { anonymousIdentityId: true, post: { select: { anonymousIdentityId: true } } },
    });

    if (!reply) {
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