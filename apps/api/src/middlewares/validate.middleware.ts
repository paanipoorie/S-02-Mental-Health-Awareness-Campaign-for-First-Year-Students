import type { Request, Response, NextFunction } from 'express';
import { type ZodTypeAny, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export interface ValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

function isValidationSchema(schema: ZodTypeAny | ValidationSchema): schema is ValidationSchema {
  if (typeof schema !== 'object' || schema === null) return false;
  if ('body' in schema || 'query' in schema || 'params' in schema) return true;
  if ('shape' in schema && typeof schema.shape === 'object' && schema.shape !== null) {
    return 'body' in schema.shape || 'query' in schema.shape || 'params' in schema.shape;
  }
  return false;
}

function extractSchema(schema: ValidationSchema, key: 'body' | 'query' | 'params'): ZodTypeAny | undefined {
  if (schema[key]) return schema[key] as ZodTypeAny;
  if ('shape' in schema && typeof (schema as Record<string, unknown>).shape === 'object') {
    const shape = (schema as Record<string, unknown>).shape as Record<string, unknown>;
    return shape[key] as ZodTypeAny | undefined;
  }
  return undefined;
}

export function validate(schema: ZodTypeAny | ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (isValidationSchema(schema)) {
        const bodySchema = extractSchema(schema, 'body');
        const querySchema = extractSchema(schema, 'query');
        const paramsSchema = extractSchema(schema, 'params');

        if (bodySchema) {
          req.body = await bodySchema.parseAsync(req.body);
        }
        if (querySchema) {
          req.query = await querySchema.parseAsync(req.query);
        }
        if (paramsSchema) {
          req.params = await paramsSchema.parseAsync(req.params);
        }
      } else {
        req.body = await schema.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
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
