import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject } from 'zod';
import { ZodError } from 'zod';

export function validateBody(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({ body: req.body });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next({
          name: 'ValidationError',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          message: 'Validation failed',
          details: errors,
        });
      }
      next(error);
    }
  };
}

export function validateQuery(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({ query: req.query });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next({
          name: 'ValidationError',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          message: 'Validation failed',
          details: errors,
        });
      }
      next(error);
    }
  };
}

export function validateParams(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({ params: req.params });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next({
          name: 'ValidationError',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          message: 'Validation failed',
          details: errors,
        });
      }
      next(error);
    }
  };
}
