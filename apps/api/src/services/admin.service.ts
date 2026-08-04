import type {
  MentorAvailabilityStatus,
  MeetingType,
  ResourceCategory as PrismaResourceCategory,
} from '@prisma/client';
import { PrismaClient, Role as PrismaRole, MeetingHostType, ChatStatus } from '@prisma/client';
import type {
  Role,
  ResourceCategory,
  MeetingCategory,
  WorkshopCategory,
} from '@campus-peer-support/shared-types';

import { getMentorIdentity } from '../utils/anonymousIdentity.js';

const prisma = new PrismaClient();

export interface PaginatedUsers {
   users: Array<{
     id: string;
     universityEmail: string;
     role: Role;
     isActive: boolean;
     isVerifiedMentor: boolean;
     createdAt: Date;
     displayName: string;
     anonymousDisplayName: string | null;
     avatarSeed: number | null;
     department: string | null;
     bio: string | null;
     specialties: string[];
     availabilityStatus: MentorAvailabilityStatus | null;
     lastSeenAt: Date | null;
     _count: {
       posts: number;
       chatThreads: number;
       meetings: number;
       workshops: number;
     };
   }>;
   total: number;
   page: number;
   limit: number;
   totalPages: number;
 }

export interface PaginatedMeetings {
  meetings: Array<{
    id: string;
    title: string;
    description: string;
    hostType: MeetingHostType;
    hostDisplayName: string | null;
    date: Date;
    time: string;
    durationMinutes: number;
    meetingType: MeetingType;
    meetingLink: string | null;
    location: string | null;
    category: MeetingCategory;
    attendeeCount: number;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedWorkshops {
  workshops: Array<{
    id: string;
    title: string;
    description: string;
    mentorId: string;
    mentorDisplayName: string;
    date: Date;
    time: string;
    durationMinutes: number;
    meetingType: MeetingType;
    meetingLink: string | null;
    location: string | null;
    category: WorkshopCategory;
    maxAttendees: number | null;
    registrationCount: number;
    resources: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  totalAdmins: number;
  verifiedMentors: number;
  totalPosts: number;
  totalChats: number;
  activeChats: number;
  totalMeetings: number;
  upcomingMeetings: number;
  totalWorkshops: number;
  upcomingWorkshops: number;
  totalResources: number;
  activeResources: number;
}

export const adminService = {
  async getAdminStats(): Promise<AdminStats> {
    const [
      totalUsers,
      totalStudents,
      totalMentors,
      totalAdmins,
      verifiedMentors,
      totalPosts,
      totalChats,
      activeChats,
      totalMeetings,
      upcomingMeetings,
      totalWorkshops,
      upcomingWorkshops,
      totalResources,
      activeResources,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: PrismaRole.STUDENT } }),
      prisma.user.count({ where: { role: PrismaRole.MENTOR } }),
      prisma.user.count({ where: { role: PrismaRole.ADMIN } }),
      prisma.user.count({ where: { role: PrismaRole.MENTOR, isVerifiedMentor: true } }),
      prisma.post.count({ where: { isDeleted: false } }),
      prisma.chatThread.count(),
      prisma.chatThread.count({ where: { status: ChatStatus.ACTIVE } }),
      prisma.meeting.count(),
      prisma.meeting.count({ where: { date: { gte: new Date() } } }),
      prisma.workshop.count(),
      prisma.workshop.count({ where: { date: { gte: new Date() } } }),
      prisma.resource.count(),
      prisma.resource.count({ where: { isActive: true } }),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalMentors,
      totalAdmins,
      verifiedMentors,
      totalPosts,
      totalChats,
      activeChats,
      totalMeetings,
      upcomingMeetings,
      totalWorkshops,
      upcomingWorkshops,
      totalResources,
      activeResources,
    };
  },

  async getUsers(query: {
    page: number;
    limit: number;
    role?: Role;
    isActive?: boolean;
    search?: string;
  }): Promise<PaginatedUsers> {
    const { page, limit, role, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { universityEmail: { contains: search, mode: 'insensitive' } },
        { anonymousIdentity: { displayName: { contains: search, mode: 'insensitive' } } },
        { mentorProfile: { department: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          anonymousIdentity: {
            select: { id: true, displayName: true, avatarSeed: true },
          },
          mentorProfile: {
            select: {
              department: true,
              bio: true,
              specialties: true,
              availabilityStatus: true,
              lastSeenAt: true,
            },
          },
          _count: {
            select: {
              chatThreads: true,
              meetings: true,
              workshops: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Get post counts separately through anonymousIdentity
    const userIds = users.map(u => u.id);
    const postCounts = await prisma.post.groupBy({
      by: ['anonymousIdentityId'],
      where: {
        anonymousIdentity: { userId: { in: userIds } },
        isDeleted: false,
      },
      _count: true,
    });

    const postCountMap = new Map(postCounts.map(p => [p.anonymousIdentityId, p._count]));

    return {
      users: users.map(user => {
        const anonId = user.anonymousIdentity?.id;
        const postCount = anonId ? (postCountMap.get(anonId) ?? 0) : 0;
        return {
          id: user.id,
          universityEmail: user.universityEmail,
          role: user.role as Role,
          isActive: user.isActive,
          isVerifiedMentor: user.isVerifiedMentor,
          createdAt: user.createdAt,
          displayName: user.universityEmail,
          anonymousDisplayName: user.anonymousIdentity?.displayName ?? null,
          avatarSeed: user.anonymousIdentity?.avatarSeed ?? null,
          department: user.mentorProfile?.department ?? null,
          bio: user.mentorProfile?.bio ?? null,
          specialties: user.mentorProfile?.specialties ?? [],
          availabilityStatus: user.mentorProfile?.availabilityStatus ?? null,
          lastSeenAt: user.mentorProfile?.lastSeenAt ?? null,
          _count: {
            ...user._count,
            posts: postCount,
          },
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getMentors(query: {
    page: number;
    limit: number;
    isVerified?: boolean;
    availabilityStatus?: MentorAvailabilityStatus;
    search?: string;
  }): Promise<PaginatedUsers> {
    const { page, limit, isVerified, availabilityStatus, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      role: PrismaRole.MENTOR,
    };

    if (isVerified !== undefined) {
      where.isVerifiedMentor = isVerified;
    }

    if (search) {
      where.OR = [
        { universityEmail: { contains: search, mode: 'insensitive' } },
        { anonymousIdentity: { displayName: { contains: search, mode: 'insensitive' } } },
        { mentorProfile: { department: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const mentorWhere: Record<string, unknown> = {};
    if (availabilityStatus) {
      mentorWhere.availabilityStatus = availabilityStatus;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          anonymousIdentity: {
            select: { id: true, displayName: true, avatarSeed: true },
          },
          mentorProfile: {
            where: mentorWhere,
            select: {
              department: true,
              bio: true,
              specialties: true,
              availabilityStatus: true,
              lastSeenAt: true,
            },
          },
          _count: {
            select: {
              chatThreads: true,
              meetings: true,
              workshops: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Get post counts separately through anonymousIdentity
    const userIds = users.map(u => u.id);
    const postCounts = await prisma.post.groupBy({
      by: ['anonymousIdentityId'],
      where: {
        anonymousIdentity: { userId: { in: userIds } },
        isDeleted: false,
      },
      _count: true,
    });

    const postCountMap = new Map(postCounts.map(p => [p.anonymousIdentityId, p._count]));

    // Filter out users without mentor profile if availabilityStatus filter was applied
    const filteredUsers = availabilityStatus ? users.filter(u => u.mentorProfile) : users;

    return {
      users: filteredUsers.map(user => {
        const anonId = user.anonymousIdentity?.id;
        const postCount = anonId ? (postCountMap.get(anonId) ?? 0) : 0;
        return {
          id: user.id,
          universityEmail: user.universityEmail,
          role: user.role as Role,
          isActive: user.isActive,
          isVerifiedMentor: user.isVerifiedMentor,
          createdAt: user.createdAt,
          displayName: user.universityEmail,
          anonymousDisplayName: user.anonymousIdentity?.displayName ?? null,
          avatarSeed: user.anonymousIdentity?.avatarSeed ?? null,
          department: user.mentorProfile?.department ?? null,
          bio: user.mentorProfile?.bio ?? null,
          specialties: user.mentorProfile?.specialties ?? [],
          availabilityStatus: user.mentorProfile?.availabilityStatus ?? null,
          lastSeenAt: user.mentorProfile?.lastSeenAt ?? null,
          _count: {
            ...user._count,
            posts: postCount,
          },
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getPendingMentors(): Promise<
    Array<{
      id: string;
      universityEmail: string;
      displayName: string | null;
      createdAt: Date;
    }>
  > {
    const mentors = await prisma.user.findMany({
      where: {
        role: PrismaRole.MENTOR,
        isVerifiedMentor: false,
        isActive: true,
      },
      include: {
        anonymousIdentity: {
          select: { displayName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return mentors.map(mentor => ({
      id: mentor.id,
      universityEmail: mentor.universityEmail,
      displayName: mentor.universityEmail,
      createdAt: mentor.createdAt,
    }));
  },

  async rejectMentor(adminUserId: string, mentorId: string) {
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId, role: PrismaRole.MENTOR },
      select: { id: true, universityEmail: true, isVerifiedMentor: true },
    });

    if (!mentor) {
      throw new Error('MENTOR_NOT_FOUND');
    }

    if (mentor.isVerifiedMentor) {
      throw new Error('MENTOR_ALREADY_VERIFIED');
    }

    // Rejection deactivates the account so the mentor can no longer log in.
    const updated = await prisma.user.update({
      where: { id: mentorId },
      data: { isActive: false, isVerifiedMentor: false },
    });

    await prisma.adminActionLog.create({
      data: {
        adminUserId,
        actionType: 'MENTOR_REJECTED',
        targetType: 'USER',
        targetId: mentorId,
        notes: `Mentor application for ${mentor.universityEmail} rejected by admin`,
      },
    });

    return updated;
  },

  async updateUserStatus(adminUserId: string, targetUserId: string, isActive: boolean) {
    if (adminUserId === targetUserId) {
      throw new Error('SELF_DEACTIVATION_NOT_ALLOWED');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      throw new Error('USER_NOT_FOUND');
    }

    // Prevent deactivating the last admin
    if (targetUser.role === PrismaRole.ADMIN && !isActive) {
      const adminCount = await prisma.user.count({
        where: { role: PrismaRole.ADMIN, isActive: true },
      });
      if (adminCount <= 1) {
        throw new Error('LAST_ADMIN_CANNOT_BE_DEACTIVATED');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
    });

    // Log admin action
    await prisma.adminActionLog.create({
      data: {
        adminUserId,
        actionType: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        targetType: 'USER',
        targetId: targetUserId,
        notes: `User ${isActive ? 'activated' : 'deactivated'} by admin`,
      },
    });

    return updatedUser;
  },

  async verifyMentor(adminUserId: string, mentorId: string, isVerified: boolean) {
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId, role: PrismaRole.MENTOR },
      select: { id: true, isVerifiedMentor: true },
    });

    if (!mentor) {
      throw new Error('MENTOR_NOT_FOUND');
    }

    if (mentor.isVerifiedMentor === isVerified) {
      throw new Error('MENTOR_VERIFICATION_STATUS_UNCHANGED');
    }

    const updatedMentor = await prisma.user.update({
      where: { id: mentorId },
      data: { isVerifiedMentor: isVerified },
    });

    // Log admin action
    await prisma.adminActionLog.create({
      data: {
        adminUserId,
        actionType: isVerified ? 'MENTOR_VERIFIED' : 'MENTOR_UNVERIFIED',
        targetType: 'USER',
        targetId: mentorId,
        notes: `Mentor ${isVerified ? 'verified' : 'unverified'} by admin`,
      },
    });

    return updatedMentor;
  },

  async getMeetings(query: {
    page: number;
    limit: number;
    hostType?: MeetingHostType;
    meetingType?: MeetingType;
    category?: MeetingCategory;
    upcoming?: boolean;
    search?: string;
  }): Promise<PaginatedMeetings> {
    const { page, limit, hostType, meetingType, category, upcoming, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (hostType) {
      where.hostType = hostType;
    }

    if (meetingType) {
      where.meetingType = meetingType;
    }

    if (category) {
      where.category = category;
    }

    if (upcoming) {
      where.date = { gte: new Date() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { hostIdentity: { displayName: { contains: search, mode: 'insensitive' } } },
        {
          hostUser: {
            anonymousIdentity: { displayName: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        include: {
          hostIdentity: { select: { displayName: true } },
          hostUser: {
            include: {
              anonymousIdentity: { select: { displayName: true } },
            },
          },
          _count: { select: { attendees: true } },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.meeting.count({ where }),
    ]);

    const formattedMeetings = await Promise.all(
      meetings.map(async m => {
        let hostDisplayName = null;
        if (m.hostType === MeetingHostType.STUDENT) {
          hostDisplayName = m.hostIdentity?.displayName ?? null;
        } else if (m.hostUserId) {
          const mentorIdent = await getMentorIdentity(m.hostUserId);
          hostDisplayName = mentorIdent.displayName;
        }

        return {
          id: m.id,
          title: m.title,
          description: m.description,
          hostType: m.hostType,
          hostDisplayName,
          date: m.date,
          time: m.time,
          durationMinutes: m.durationMinutes,
          meetingType: m.meetingType,
          meetingLink: m.meetingLink,
          location: m.location,
          category: m.category as MeetingCategory,
          attendeeCount: m._count.attendees,
          createdAt: m.createdAt,
        };
      })
    );

    return {
      meetings: formattedMeetings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async deleteMeeting(adminUserId: string, meetingId: string) {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, title: true },
    });

    if (!meeting) {
      throw new Error('MEETING_NOT_FOUND');
    }

    await prisma.meeting.delete({
      where: { id: meetingId },
    });

    // Log admin action
    await prisma.adminActionLog.create({
      data: {
        adminUserId,
        actionType: 'MEETING_FORCE_DELETED',
        targetType: 'MEETING',
        targetId: meetingId,
        notes: `Meeting "${meeting.title}" force-deleted by admin`,
      },
    });

    return { success: true };
  },

  async getWorkshops(query: {
    page: number;
    limit: number;
    meetingType?: MeetingType;
    category?: WorkshopCategory;
    upcoming?: boolean;
    search?: string;
  }): Promise<PaginatedWorkshops> {
    const { page, limit, meetingType, category, upcoming, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (meetingType) {
      where.meetingType = meetingType;
    }

    if (category) {
      where.category = category;
    }

    if (upcoming) {
      where.date = { gte: new Date() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          mentor: { anonymousIdentity: { displayName: { contains: search, mode: 'insensitive' } } },
        },
      ];
    }

    const [workshops, total] = await Promise.all([
      prisma.workshop.findMany({
        where,
        include: {
          mentor: {
            include: {
              anonymousIdentity: { select: { displayName: true } },
            },
          },
          _count: { select: { registrations: true } },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.workshop.count({ where }),
    ]);

    const formattedWorkshops = await Promise.all(
      workshops.map(async w => {
        const mentorIdent = await getMentorIdentity(w.mentorId);
        return {
          id: w.id,
          title: w.title,
          description: w.description,
          mentorId: w.mentorId,
          mentorDisplayName: mentorIdent.displayName,
          date: w.date,
          time: w.time,
          durationMinutes: w.durationMinutes,
          meetingType: w.meetingType,
          meetingLink: w.meetingLink,
          location: w.location,
          category: w.category as WorkshopCategory,
          maxAttendees: w.maxAttendees,
          registrationCount: w._count.registrations,
          resources: w.resources,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        };
      })
    );

    return {
      workshops: formattedWorkshops,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async deleteWorkshop(adminUserId: string, workshopId: string) {
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      select: { id: true, title: true },
    });

    if (!workshop) {
      throw new Error('WORKSHOP_NOT_FOUND');
    }

    await prisma.workshop.delete({
      where: { id: workshopId },
    });

    // Log admin action
    await prisma.adminActionLog.create({
      data: {
        adminUserId,
        actionType: 'WORKSHOP_FORCE_DELETED',
        targetType: 'WORKSHOP',
        targetId: workshopId,
        notes: `Workshop "${workshop.title}" force-deleted by admin`,
      },
    });

    return { success: true };
  },

  async getResources(query: {
    page: number;
    limit: number;
    category?: ResourceCategory;
    isActive?: boolean;
    search?: string;
  }): Promise<PaginatedResources> {
    const { page, limit, category, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
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
      resources: resources.map(r => ({
        ...r,
        category: r.category as ResourceCategory,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async createResource(data: {
    title: string;
    description: string;
    category: ResourceCategory;
    content: string;
    link: string | null;
    isActive: boolean;
  }) {
    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category as PrismaResourceCategory,
        content: data.content,
        link: data.link,
        isActive: data.isActive,
      },
    });

    return resource;
  },

  async updateResource(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: ResourceCategory;
      content?: string;
      link?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.resource.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category as PrismaResourceCategory;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const resource = await prisma.resource.update({
      where: { id },
      data: updateData,
    });

    return resource;
  },

  async deleteResource(id: string) {
    const existing = await prisma.resource.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existing) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    await prisma.resource.delete({
      where: { id },
    });

    return { success: true };
  },

  async getAdminActionLogs(query: {
    page: number;
    limit: number;
    adminUserId?: string;
    actionType?: string;
    targetType?: string;
  }) {
    const { page, limit, adminUserId, actionType, targetType } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (adminUserId) where.adminUserId = adminUserId;
    if (actionType) where.actionType = actionType;
    if (targetType) where.targetType = targetType;

    const [logs, total] = await Promise.all([
      prisma.adminActionLog.findMany({
        where,
        include: {
          adminUser: {
            select: {
              id: true,
              universityEmail: true,
              anonymousIdentity: { select: { displayName: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminActionLog.count({ where }),
    ]);

    return {
      logs: logs.map(log => ({
        id: log.id,
        adminUserId: log.adminUserId,
        adminUserEmail: log.adminUser.universityEmail,
        adminUserDisplayName: log.adminUser.anonymousIdentity?.displayName,
        actionType: log.actionType,
        targetType: log.targetType,
        targetId: log.targetId,
        notes: log.notes,
        createdAt: log.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};
