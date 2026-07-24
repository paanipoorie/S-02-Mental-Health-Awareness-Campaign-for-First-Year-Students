import type { Request, Response, NextFunction } from 'express';
import { resourceService } from '../services/resource.service.js';
import { ApiError } from '../utils/ApiError.js';

export const resourceController = {
  async getResources(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const filters: { category?: any; search?: string } = { category: category as any };
      if (search !== undefined) filters.search = search;

      const result = await resourceService.getResources(page, limit, filters);

      res.json({
        success: true,
        data: result.resources,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getResourceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError(400, 'Resource ID is required', 'INVALID_ID');
      }

      const resource = await resourceService.getResourceById(id);

      if (!resource) {
        throw new ApiError(404, 'Resource not found', 'RESOURCE_NOT_FOUND');
      }

      res.json({
        success: true,
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resourceService.getCategories();

      res.json({
        success: true,
        data: result.categories,
      });
    } catch (error) {
      next(error);
    }
  },
};
