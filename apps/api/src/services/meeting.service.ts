import type {
  Prisma,
  MeetingType,
  MeetingHostType,
  MeetingCategory,
  WorkshopCategory,
} from '@prisma/client';
import { PrismaClient, WorkshopRegistrationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface MeetingData {
  title: string;
  description: string;
  date: Date;
  time: string;
  durationMinutes: number;
  meetingType: MeetingType;
  meetingLink: string | null;
  location: string | null;
  category: MeetingCategory;
  hostType: MeetingHostType;
}

export interface PaginatedMeetings {
  meetings: Array<{
    id: string;
    title: string;
    description: string;
    hostType: MeetingHostType;
    hostIdentityId: string | null;
    hostUserId: string | null;
    date: Date;
    time: string;
    durationMinutes: number;
    meetingType: MeetingType;
    meetingLink: string | null;
    location: string | null;
    category: MeetingCategory;
    createdAt: Date;
    hostDisplayName: string | null;
    attendeeCount: number;
    isAttending: boolean;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkshopData {
  title: string;
  description: string;
  date: Date;
  time: string;
  durationMinutes: number;
  meetingType: MeetingType;
  meetingLink: string | null;
  location: string | null;
  category: WorkshopCategory;
  maxAttendees: number | null;
  resources: string | null;
}

export interface PaginatedWorkshops {
  workshops: Array<{
    id: string;
    title: string;
    description: string;
    mentorId: string;
    date: Date;
    time: string;
    durationMinutes: number;
    meetingType: MeetingType;
    meetingLink: string | null;
    location: string | null;
    category: WorkshopCategory;
    maxAttendees: number | null;
    resources: string | null;
    createdAt: Date;
    mentorDisplayName: string;
    registrationCount: number;
    userRegistrationStatus: WorkshopRegistrationStatus | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function getAnonId(userId: string): Promise<string | null> {
  const identity = await prisma.anonymousIdentity.findUnique({
    where: { userId },
    select: { id: true },
  });
  return identity?.id ?? null;
}

export const meetingService = {
  async createMeeting(userId: string, userRole: string, data: MeetingData) {
    const isStudent = userRole === 'STUDENT';
    let hostIdentityId: string | null = null;
    let hostUserId: string | null = null;

    if (isStudent) {
      const anonIdentity = await prisma.anonymousIdentity.findUnique({
        where: { userId },
        select: { id: true },
      });
      hostIdentityId = anonIdentity?.id ?? null;
    } else {
      hostUserId = userId;
    }

    const meetingData: any = { ...data };
    if (hostIdentityId !== null) meetingData.hostIdentityId = hostIdentityId;
    if (hostUserId !== null) meetingData.hostUserId = hostUserId;

    const meeting = await prisma.meeting.create({ data: meetingData });
    return meeting;
  },

  async getMeetings(
    page: number,
    limit: number,
    filters: { upcoming?: boolean; category?: MeetingCategory; hostType?: MeetingHostType },
    userId?: string
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.MeetingWhereInput = {};

    if (filters.upcoming) {
      where.date = { gte: new Date() };
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.hostType) {
      where.hostType = filters.hostType;
    }

    const anonId = userId ? await getAnonId(userId) : null;

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        include: {
          hostIdentity: { select: { displayName: true } },
          hostUser: { select: { anonymousIdentity: { select: { displayName: true } } } },
          _count: { select: { attendees: true } },
          attendees: anonId ? { where: { anonymousIdentityId: anonId } } : false,
        },
        skip,
        take: limit,
        orderBy: { date: 'asc' },
      }),
      prisma.meeting.count({ where }),
    ]);

    return {
      meetings: meetings.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        hostType: m.hostType,
        hostIdentityId: m.hostIdentityId,
        hostUserId: m.hostUserId,
        date: m.date,
        time: m.time,
        durationMinutes: m.durationMinutes,
        meetingType: m.meetingType,
        meetingLink: m.meetingLink,
        location: m.location,
        category: m.category,
        createdAt: m.createdAt,
        hostDisplayName:
          m.hostIdentity?.displayName ?? m.hostUser?.anonymousIdentity?.displayName ?? null,
        attendeeCount: m._count.attendees,
        isAttending: anonId ? m.attendees.length > 0 : false,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getMeetingById(id: string, userId?: string) {
    const anonId = userId ? await getAnonId(userId) : null;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        hostIdentity: { select: { displayName: true } },
        hostUser: { select: { anonymousIdentity: { select: { displayName: true } } } },
        attendees: { include: { anonymousIdentity: { select: { displayName: true } } } },
        _count: { select: { attendees: true } },
      },
    });

    if (!meeting) return null;

    let isAttending = false;
    if (anonId) {
      isAttending = meeting.attendees.some(a => a.anonymousIdentityId === anonId);
    }

    return {
      ...meeting,
      hostDisplayName:
        meeting.hostIdentity?.displayName ??
        meeting.hostUser?.anonymousIdentity?.displayName ??
        null,
      isAttending,
    };
  },

  async rsvpMeeting(meetingId: string, userId: string) {
    const anonId = await getAnonId(userId);
    if (!anonId) throw new Error('Anonymous identity not found');

    const existing = await prisma.meetingAttendee.findFirst({
      where: { meetingId, anonymousIdentityId: anonId },
    });

    if (existing) {
      await prisma.meetingAttendee.delete({ where: { id: existing.id } });
      return { rsvped: false };
    }

    await prisma.meetingAttendee.create({ data: { meetingId, anonymousIdentityId: anonId } });
    return { rsvped: true };
  },

  async cancelMeeting(meetingId: string, userId: string, userRole: string) {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new Error('Meeting not found');

    let isHost = false;
    if (userRole === 'STUDENT') {
      const hostAnonId = await getAnonId(userId);
      isHost = meeting.hostIdentityId === hostAnonId;
    } else {
      isHost = meeting.hostUserId === userId;
    }

    if (!isHost) throw new Error('Only host can cancel meeting');

    await prisma.meeting.delete({ where: { id: meetingId } });
    return { deleted: true };
  },

  async getUpcomingMeetingsForStudent(anonymousIdentityId: string) {
    const now = new Date();
    const meetings = await prisma.meeting.findMany({
      where: {
        date: { gte: now },
        attendees: { some: { anonymousIdentityId } },
      },
      include: {
        hostIdentity: { select: { displayName: true } },
        hostUser: { select: { anonymousIdentity: { select: { displayName: true } } } },
        _count: { select: { attendees: true } },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    return {
      meetings: meetings.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        hostType: m.hostType,
        date: m.date,
        time: m.time,
        durationMinutes: m.durationMinutes,
        meetingType: m.meetingType,
        meetingLink: m.meetingLink,
        location: m.location,
        category: m.category,
        hostDisplayName:
          m.hostIdentity?.displayName ?? m.hostUser?.anonymousIdentity?.displayName ?? null,
        attendeeCount: m._count.attendees,
        isAttending: true,
      })),
      total: meetings.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
  },

  async getUpcomingWorkshopsForStudent(anonymousIdentityId: string) {
    const now = new Date();
    const registrations = await prisma.workshopRegistration.findMany({
      where: {
        anonymousIdentityId,
        status: 'REGISTERED',
        workshop: { date: { gte: now } },
      },
      include: {
        workshop: {
          include: {
            mentor: { select: { anonymousIdentity: { select: { displayName: true } } } },
            _count: { select: { registrations: true } },
          },
        },
      },
      orderBy: { workshop: { date: 'asc' } },
      take: 10,
    });

    return {
      workshops: registrations.map(r => ({
        id: r.workshop.id,
        title: r.workshop.title,
        description: r.workshop.description,
        date: r.workshop.date,
        time: r.workshop.time,
        durationMinutes: r.workshop.durationMinutes,
        meetingType: r.workshop.meetingType,
        meetingLink: r.workshop.meetingLink,
        location: r.workshop.location,
        category: r.workshop.category,
        maxAttendees: r.workshop.maxAttendees,
        resources: r.workshop.resources,
        createdAt: r.workshop.createdAt,
        mentorDisplayName: r.workshop.mentor.anonymousIdentity?.displayName ?? 'Unknown Mentor',
        registrationCount: r.workshop._count.registrations,
        userRegistrationStatus: r.status,
      })),
      total: registrations.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
  },

  async getTodaysMeetingsForMentor(mentorId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const meetings = await prisma.meeting.findMany({
      where: {
        date: { gte: todayStart, lt: todayEnd },
        OR: [
          { hostUserId: mentorId },
          { attendees: { some: { anonymousIdentity: { userId: mentorId } } } },
        ],
      },
      include: {
        hostIdentity: { select: { displayName: true } },
        hostUser: { select: { anonymousIdentity: { select: { displayName: true } } } },
        _count: { select: { attendees: true } },
      },
      orderBy: { time: 'asc' },
    });

    return {
      meetings: meetings.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        hostType: m.hostType,
        date: m.date,
        time: m.time,
        durationMinutes: m.durationMinutes,
        meetingType: m.meetingType,
        meetingLink: m.meetingLink,
        location: m.location,
        category: m.category,
        attendeeCount: m._count.attendees,
        isHost: m.hostUserId === mentorId,
      })),
      total: meetings.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  },

  async getTodaysWorkshopsForMentor(mentorId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const workshops = await prisma.workshop.findMany({
      where: {
        mentorId,
        date: { gte: todayStart, lt: todayEnd },
      },
      include: {
        _count: { select: { registrations: true } },
      },
      orderBy: { time: 'asc' },
    });

    return {
      workshops: workshops.map(w => ({
        id: w.id,
        title: w.title,
        description: w.description,
        date: w.date,
        time: w.time,
        durationMinutes: w.durationMinutes,
        meetingType: w.meetingType,
        meetingLink: w.meetingLink,
        location: w.location,
        category: w.category,
        maxAttendees: w.maxAttendees,
        registrationCount: w._count.registrations,
      })),
      total: workshops.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  },
};

export const workshopService = {
  async createWorkshop(mentorId: string, data: WorkshopData) {
    const workshop = await prisma.workshop.create({ data: { ...data, mentorId } });
    return workshop;
  },

  async getWorkshops(
    page: number,
    limit: number,
    filters: { upcoming?: boolean; category?: WorkshopCategory },
    userId?: string
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.WorkshopWhereInput = {};

    if (filters.upcoming) {
      where.date = { gte: new Date() };
    }
    if (filters.category) {
      where.category = filters.category;
    }

    const anonId = userId ? await getAnonId(userId) : null;

    const [workshops, total] = await Promise.all([
      prisma.workshop.findMany({
        where,
        include: {
          mentor: { select: { anonymousIdentity: { select: { displayName: true } } } },
          _count: { select: { registrations: true } },
          registrations: anonId ? { where: { anonymousIdentityId: anonId } } : false,
        },
        skip,
        take: limit,
        orderBy: { date: 'asc' },
      }),
      prisma.workshop.count({ where }),
    ]);

    return {
      workshops: workshops.map(w => ({
        id: w.id,
        title: w.title,
        description: w.description,
        mentorId: w.mentorId,
        date: w.date,
        time: w.time,
        durationMinutes: w.durationMinutes,
        meetingType: w.meetingType,
        meetingLink: w.meetingLink,
        location: w.location,
        category: w.category,
        maxAttendees: w.maxAttendees,
        resources: w.resources,
        createdAt: w.createdAt,
        mentorDisplayName: w.mentor.anonymousIdentity?.displayName ?? 'Unknown Mentor',
        registrationCount: w._count.registrations,
        userRegistrationStatus: anonId ? (w.registrations[0]?.status ?? null) : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getWorkshopById(id: string, userId?: string) {
    const anonId = userId ? await getAnonId(userId) : null;

    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        mentor: { select: { anonymousIdentity: { select: { displayName: true } } } },
        registrations: { include: { anonymousIdentity: { select: { displayName: true } } } },
        _count: { select: { registrations: true } },
      },
    });

    if (!workshop) return null;

    let userRegistration = null;
    if (anonId) {
      userRegistration = workshop.registrations.find(r => r.anonymousIdentityId === anonId) ?? null;
    }

    return {
      ...workshop,
      mentorDisplayName: workshop.mentor.anonymousIdentity?.displayName ?? 'Unknown Mentor',
      userRegistration,
    };
  },

  async registerWorkshop(workshopId: string, userId: string) {
    const anonId = await getAnonId(userId);
    if (!anonId) throw new Error('Anonymous identity not found');

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: { _count: { select: { registrations: true } } },
    });
    if (!workshop) throw new Error('Workshop not found');

    if (workshop.maxAttendees && workshop._count.registrations >= workshop.maxAttendees) {
      throw new Error('Workshop is full');
    }

    const existing = await prisma.workshopRegistration.findFirst({
      where: { workshopId, anonymousIdentityId: anonId },
    });

    if (existing) {
      if (existing.status === WorkshopRegistrationStatus.CANCELLED) {
        await prisma.workshopRegistration.update({
          where: { id: existing.id },
          data: { status: WorkshopRegistrationStatus.REGISTERED },
        });
      }
      return existing;
    }

    return prisma.workshopRegistration.create({
      data: {
        workshopId,
        anonymousIdentityId: anonId,
        status: WorkshopRegistrationStatus.REGISTERED,
      },
    });
  },

  async cancelRegistration(workshopId: string, userId: string) {
    const anonId = await getAnonId(userId);
    if (!anonId) throw new Error('Anonymous identity not found');

    const registration = await prisma.workshopRegistration.findFirst({
      where: { workshopId, anonymousIdentityId: anonId },
    });

    if (!registration) throw new Error('Registration not found');

    await prisma.workshopRegistration.update({
      where: { id: registration.id },
      data: { status: WorkshopRegistrationStatus.CANCELLED },
    });
    return { cancelled: true };
  },

  async markAttendance(
    workshopId: string,
    anonymousIdentityId: string,
    status: WorkshopRegistrationStatus
  ) {
    const registration = await prisma.workshopRegistration.findFirst({
      where: { workshopId, anonymousIdentityId },
    });

    if (!registration) throw new Error('Registration not found');

    return prisma.workshopRegistration.update({
      where: { id: registration.id },
      data: {
        status,
        attendedAt: status === WorkshopRegistrationStatus.ATTENDED ? new Date() : null,
      },
    });
  },

  async cancelWorkshop(workshopId: string, mentorId: string) {
    const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new Error('Workshop not found');
    if (workshop.mentorId !== mentorId) throw new Error('Only mentor can cancel workshop');

    await prisma.workshop.delete({ where: { id: workshopId } });
    return { deleted: true };
  },
};
