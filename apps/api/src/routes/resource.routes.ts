import { Router } from 'express';
import { resourceController } from '../controllers/resource.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getResourcesQuerySchema,
  getResourceParamsSchema,
} from '../validators/resource.validator.js';

const router: Router = Router();

router.get('/', validate(getResourcesQuerySchema), resourceController.getResources);
router.get('/categories', resourceController.getCategories);
router.get('/:id', validate(getResourceParamsSchema), resourceController.getResourceById);

export default router;
