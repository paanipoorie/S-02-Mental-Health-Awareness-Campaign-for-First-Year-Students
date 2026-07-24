import { z } from 'zod';
import { ResourceCategory } from '@campus-peer-support/shared-types/enums';

export const getResourcesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    category: z.nativeEnum(ResourceCategory).optional(),
    search: z.string().optional(),
  }),
});

export const getResourceParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid resource ID'),
  }),
});

export type GetResourcesQuery = z.infer<typeof getResourcesQuerySchema>['query'];
export type GetResourceParams = z.infer<typeof getResourceParamsSchema>['params'];
