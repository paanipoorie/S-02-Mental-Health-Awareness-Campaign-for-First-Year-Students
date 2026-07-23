import type { Prisma } from '@prisma/client';
import { PrismaClient, MentorAvailabilityStatus } from '@prisma/client';
import type {
  PostCategory,
  EmotionType,
  UrgencyLevel,
} from '@campus-peer-support/shared-types/enums';

const prisma = new PrismaClient();

const EMOTION_PRIORITY: Record<string, number> = {
  OVERWHELMED: 10,
  ANXIOUS: 10,
  SCARED: 10,
  STRESSED: 9,
  BURNT_OUT: 9,
  HOMESICK: 8,
  LONELY: 8,
  CONFUSED: 5,
  HAPPY: 1,
  EXCITED: 1,
};

export interface MentorProfileData {
  department?: string;
  bio?: string;
  specialties?: string[];
}

export interface PaginatedMentors {
  mentors: Array<{
    id: string;
    displayName: string;
    department: string;
    bio: string;
    specialties: string[];
    availabilityStatus: MentorAvailabilityStatus;
    isVerifiedMentor: boolean;
    lastSeenAt: Date | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PriorityFeedPost {
  id: string;
  title: string;
  body: string;
  category: PostCategory;
  emotion: EmotionType | null;
  urgencyLevel: UrgencyLevel | null;
  createdAt: Date;
  anonymousDisplayName: string;
  replyCount: number;
}

export interface PaginatedPriorityFeed {
  posts: PriorityFeedPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const mentorService = {
  async getMentorProfile(userId: string) {
    const profile = await prisma.mentorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            isVerifiedMentor: true,
            anonymousIdentity: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      userId: profile.userId,
      department: profile.department,
      bio: profile.bio,
      specialties: profile.specialties,
      availabilityStatus: profile.availabilityStatus,
      lastSeenAt: profile.lastSeenAt,
      isVerifiedMentor: profile.user.isVerifiedMentor,
      displayName: profile.user.anonymousIdentity?.displayName ?? 'Unknown Mentor',
    };
  },

  async updateMentorProfile(userId: string, data: MentorProfileData) {
    const updateData: Prisma.MentorProfileUpdateInput = {};
    if (data.department !== undefined) updateData.department = data.department;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.specialties !== undefined) updateData.specialties = data.specialties;

    const profile = await prisma.mentorProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        department: data.department ?? '',
        bio: data.bio ?? '',
        specialties: data.specialties ?? [],
        availabilityStatus: MentorAvailabilityStatus.OFFLINE,
      },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      department: profile.department,
      bio: profile.bio,
      specialties: profile.specialties,
      availabilityStatus: profile.availabilityStatus,
      lastSeenAt: profile.lastSeenAt,
    };
  },

  async updateAvailability(userId: string, availabilityStatus: MentorAvailabilityStatus) {
    const profile = await prisma.mentorProfile.update({
      where: { userId },
      data: {
        availabilityStatus,
        lastSeenAt: new Date(),
      },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      availabilityStatus: profile.availabilityStatus,
      lastSeenAt: profile.lastSeenAt,
    };
  },

  async getMentors(page: number, limit: number): Promise<PaginatedMentors> {
    const skip = (page - 1) * limit;

    const [mentors, total] = await Promise.all([
      prisma.mentorProfile.findMany({
        where: {
          user: {
            isVerifiedMentor: true,
            isActive: true,
          },
        },
        include: {
          user: {
            select: {
              isVerifiedMentor: true,
              anonymousIdentity: {
                select: {
                  displayName: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          availabilityStatus: 'asc',
        },
      }),
      prisma.mentorProfile.count({
        where: {
          user: {
            isVerifiedMentor: true,
            isActive: true,
          },
        },
      }),
    ]);

    return {
      mentors: mentors.map(mentor => ({
        id: mentor.id,
        displayName: mentor.user.anonymousIdentity?.displayName ?? 'Unknown Mentor',
        department: mentor.department,
        bio: mentor.bio,
        specialties: mentor.specialties,
        availabilityStatus: mentor.availabilityStatus,
        isVerifiedMentor: mentor.user.isVerifiedMentor,
        lastSeenAt: mentor.lastSeenAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getPriorityFeed(
    page: number,
    limit: number,
    emotionFilter?: string,
    categoryFilter?: string
  ): Promise<PaginatedPriorityFeed> {
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      isDeleted: false,
    };

    if (emotionFilter) {
      where.emotion = emotionFilter as any;
    }

    if (categoryFilter) {
      where.category = categoryFilter as PostCategory;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          anonymousIdentity: {
            select: {
              displayName: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          {
            emotion: 'asc',
          },
          {
            urgencyLevel: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
      }),
      prisma.post.count({ where }),
    ]);

    const sortedPosts = posts.sort((a, b) => {
      const priorityA = EMOTION_PRIORITY[a.emotion ?? ''] ?? 0;
      const priorityB = EMOTION_PRIORITY[b.emotion ?? ''] ?? 0;
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      const urgencyOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const urgencyA = urgencyOrder[a.urgencyLevel as keyof typeof urgencyOrder] ?? 0;
      const urgencyB = urgencyOrder[b.urgencyLevel as keyof typeof urgencyOrder] ?? 0;
      if (urgencyA !== urgencyB) {
        return urgencyB - urgencyA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      posts: sortedPosts.map(post => ({
        id: post.id,
        title: post.title,
        body: post.body,
        category: post.category as PostCategory,
        emotion: post.emotion as EmotionType | null,
        urgencyLevel: post.urgencyLevel as UrgencyLevel | null,
        createdAt: post.createdAt,
        anonymousDisplayName: post.anonymousIdentity.displayName,
        replyCount: post._count.replies,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};
