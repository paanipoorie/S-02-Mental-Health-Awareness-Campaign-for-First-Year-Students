import { Router } from 'express';
import { postController } from '../controllers/post.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/index.js';
import {
  createPostSchema,
  getPostsQuerySchema,
  getPostParamsSchema,
  createReplySchema,
  replyParamsSchema,
} from '../validators/post.validator.js';

const router: Router = Router();

router.use(authMiddleware);

router.post('/', validate(createPostSchema), postController.createPost);

router.get('/', validate(getPostsQuerySchema), postController.getPosts);

router.get('/:id', validate(getPostParamsSchema), postController.getPostById);

router.patch(
  '/:id',
  validate(getPostParamsSchema),
  validate(createPostSchema),
  postController.updatePost
);

router.delete('/:id', validate(getPostParamsSchema), postController.deletePost);

router.post(
  '/:id/replies',
  validate(getPostParamsSchema),
  validate(createReplySchema),
  postController.createReply
);

router.delete('/:id/replies/:replyId', validate(replyParamsSchema), postController.deleteReply);

export default router;
