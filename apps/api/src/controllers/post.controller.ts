import type { Request, Response, NextFunction } from 'express';
import { postService } from '../services/post.service';
import type {
  CreatePostInput,
  UpdatePostInput,
  CreateReplyInput,
  GetPostsQuery,
  GetPostParams,
  DeleteReplyParams,
} from '../validators/post.validator';
import { ApiError } from '../utils/ApiError';

export const postController = {
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const data = req.body as CreatePostInput;

      if (user.role !== 'STUDENT') {
        throw new ApiError(403, 'Only students can create posts');
      }

      if (!user.anonymousIdentityId) {
        throw new ApiError(404, 'Anonymous identity not found');
      }

      const post = await postService.createPost(user.anonymousIdentityId, data);

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as GetPostsQuery;
      const result = await postService.getPosts(query);

      res.json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as GetPostParams;
      const post = await postService.getPostById(id);

      if (!post) {
        throw new ApiError(404, 'Post not found');
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as GetPostParams;
      const data = req.body as UpdatePostInput;

      if (!user.anonymousIdentityId) {
        throw new ApiError(404, 'Anonymous identity not found');
      }

      const post = await postService.updatePost(id, user.anonymousIdentityId, data);

      if (!post) {
        throw new ApiError(404, 'Post not found');
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return next(new ApiError(403, 'Not authorized to update this post'));
      }
      next(error);
    }
  },

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as GetPostParams;

      if (!user.anonymousIdentityId) {
        throw new ApiError(404, 'Anonymous identity not found');
      }

      const deleted = await postService.deletePost(id, user.anonymousIdentityId);

      if (!deleted) {
        throw new ApiError(404, 'Post not found');
      }

      res.json({
        success: true,
        data: { message: 'Post deleted successfully' },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return next(new ApiError(403, 'Not authorized to delete this post'));
      }
      next(error);
    }
  },

  async createReply(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as GetPostParams;
      const data = req.body as CreateReplyInput;

      if (!user.anonymousIdentityId) {
        throw new ApiError(404, 'Anonymous identity not found');
      }

      const reply = await postService.createReply(id, user.anonymousIdentityId, data);

      res.status(201).json({
        success: true,
        data: reply,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'POST_NOT_FOUND') {
        return next(new ApiError(404, 'Post not found'));
      }
      next(error);
    }
  },

  async deleteReply(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id, replyId } = req.params as DeleteReplyParams;

      if (!user.anonymousIdentityId) {
        throw new ApiError(404, 'Anonymous identity not found');
      }

      const deleted = await postService.deleteReply(id, replyId, user.anonymousIdentityId);

      if (!deleted) {
        throw new ApiError(404, 'Reply not found');
      }

      res.json({
        success: true,
        data: { message: 'Reply deleted successfully' },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return next(new ApiError(403, 'Not authorized to delete this reply'));
      }
      next(error);
    }
  },
};
