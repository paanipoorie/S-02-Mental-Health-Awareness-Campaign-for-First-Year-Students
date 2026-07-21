import type { Request, Response, NextFunction } from 'express';
import { type ZodTypeAny, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export interface ValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schema: ZodTypeAny | ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('parseAsync' in schema && typeof schema.parseAsync === 'function') {
        req.body = await schema.parseAsync(req.body);
      } else {
        const valSchema = schema as ValidationSchema;
        if (valSchema.body) {
          req.body = await valSchema.body.parseAsync(req.body);
        }
        if (valSchema.query) {
          req.query = await valSchema.query.parseAsync(req.query);
        }
        if (valSchema.params) {
          req.params = await valSchema.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', formattedErrors));
      } else {
        next(error);
      }
    }
  };
}

export function validateBody(schema: ZodTypeAny) {
  return validate({ body: schema });
}

export function validateQuery(schema: ZodTypeAny) {
  return validate({ query: schema });
}

export function validateParams(schema: ZodTypeAny) {
  return validate({ params: schema });
}
