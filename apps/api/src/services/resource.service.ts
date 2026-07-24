import type { Prisma, ResourceCategory } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaginatedResources {
  resources: Array<{
    id: string;
    title: string;
    description: string;
    category: ResourceCategory;
    content: string;
    link: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResourceCategories {
  categories: Array<{
    category: ResourceCategory;
    count: number;
  }>;
}

export const resourceService = {
  async getResources(
    page: number,
    limit: number,
    filters: { category?: ResourceCategory; search?: string }
  ): Promise<PaginatedResources> {
    const skip = (page - 1) * limit;

    const where: Prisma.ResourceWhereInput = {
      isActive: true,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resource.count({ where }),
    ]);

    return {
      resources,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getResourceById(id: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource || !resource.isActive) {
      return null;
    }

    return resource;
  },

  async getCategories(): Promise<ResourceCategories> {
    const categories = await prisma.resource.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true },
    });

    return {
      categories: categories.map(c => ({
        category: c.category,
        count: c._count.category,
      })),
    };
  },
};
