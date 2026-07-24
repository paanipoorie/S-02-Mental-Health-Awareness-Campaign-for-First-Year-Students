import type {
  EmotionType,
  UrgencyLevel,
  PostCategory,
  MeetingType,
  MeetingCategory,
  WorkshopCategory,
  WorkshopRegistrationStatus,
} from '@prisma/client';
import {
  PrismaClient,
  Role as PrismaRole,
  MentorAvailabilityStatus,
  MeetingHostType,
  ChatStatus,
} from '@prisma/client';
import type { Role } from '@campus-peer-support/shared-types';
import { emotionService } from './emotion.service.js';
import { postService } from './post.service.js';
import { chatService } from './chat.service.js';
import { meetingService } from './meeting.service.js';
import { resourceService } from './resource.service.js';
import { mentorService } from './mentor.service.js';

const prisma = new PrismaClient();

export interface StudentDashboardData {
  currentEmotion: {
    emotion: EmotionType | null;
    urgencyLevel: UrgencyLevel | null;
    createdAt: Date | null;
  } | null;
  upcomingMeetings: Array<{
    id: string;
    title: string;
    description: string;
    hostType: MeetingHostType;
    date: Date;
    time: string;
    durationMinutes: number;
    meetingType: MeetingType;
    meetingLink: string | null;
    location: string | null;
    category: MeetingCategory;
    hostDisplayName: string | null;
    isAttending: boolean;
  }>;
  upcomingWorkshops: Array<{
    id: string;
    title: string;
    description: string;
    date: Date;
    time: string;
    durationMinutes: number;
    meetingType: MeetingType;
    meetingLink: string | null;
    location: string | null;
    category: WorkshopCategory;
    mentorDisplayName: string;
    registrationStatus: WorkshopRegistrationStatus;
  }>;
  resourcesPreview: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    link: string | null;
  }>;
  activeChats: Array<{
    id: string;
    studentIdentityId: string;
    mentorId: string | null;
    status: ChatStatus;
    createdAt: Date;
    studentDisplayName: string;
    mentorDisplayName: string | null;
    unreadCount: number;
    lastMessage: { body: string; createdAt: Date } | null;
  }>;
  recentDiscussions: Array<{
    id: string;
    title: string;
    body: string;
    category: PostCategory;
    emotion: EmotionType | null;
    urgencyLevel: UrgencyLevel | null;
    createdAt: Date;
    anonymousDisplayName: string;
    replyCount: number;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: Date;
  }>;
}

export interface MentorDashboardData {
  waitingChats: Array<{
    id: string;
    studentIdentityId: string;
    status: ChatStatus;
    createdAt: Date;
    studentDisplayName: string;
    studentAvatarSeed: number;
    latestEmotion: {
      emotion: EmotionType;
      urgencyLevel: UrgencyLevel | null;
      createdAt: Date;
    } | null;
  }>;
  assignedStudents: Array<{
    id: string;
    studentIdentityId: string;
    studentDisplayName: string;
    studentAvatarSeed: number;
    status: ChatStatus;
    createdAt: Date;
    latestEmotion: {
      emotion: EmotionType;
      urgencyLevel: UrgencyLevel | null;
      createdAt: Date;
    } | null;
    unreadCount: number;
    lastMessage: { body: string; createdAt: Date } | null;
  }>;
  studentEmotionOverview: {
    windowHours: number;
    totalLogs: number;
    emotionCounts: Record<EmotionType, number>;
    urgencyCounts: Record<UrgencyLevel, number>;
    emotionUrgencyBreakdown: Record<EmotionType, Record<UrgencyLevel, number>>;
    priorityStudents: Array<{
      studentIdentityId: string;
      studentDisplayName: string;
      latestEmotion: EmotionType;
      latestUrgency: UrgencyLevel | null;
      chatId: string;
    }>;
  };
  todaysMeetings: Array<{
    id: string;
    title: string;
    description: string;
    hostType: MeetingHostType;
    date: Date;
    time: string;
    durationMinutes: number;
    meetingType: MeetingType;
    meetingLink: string | null;
    location: string | null;
    category: MeetingCategory;
    attendeeCount: number;
    isHost: boolean;
  }>;
  todaysWorkshops: Array<{
    id: string;
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
    registrationCount: number;
  }>;
  mentorAvailability: MentorAvailabilityStatus;
  recentDiscussions: Array<{
    id: string;
    title: string;
    body: string;
    category: PostCategory;
    emotion: EmotionType | null;
    urgencyLevel: UrgencyLevel | null;
    createdAt: Date;
    anonymousDisplayName: string;
    replyCount: number;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: Date;
  }>;
}

export interface AdminDashboardData {
  platformStats: {
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
  };
  activeStudents: Array<{
    id: string;
    anonymousDisplayName: string;
    createdAt: Date;
    lastEmotionAt: Date | null;
    postCount: number;
    activeChats: number;
  }>;
  activeMentors: Array<{
    id: string;
    displayName: string;
    department: string;
    isVerifiedMentor: boolean;
    availabilityStatus: MentorAvailabilityStatus;
    activeChats: number;
    hostedMeetings: number;
    hostedWorkshops: number;
    lastSeenAt: Date | null;
  }>;
  meetingsOverview: Array<{
    id: string;
    title: string;
    hostType: MeetingHostType;
    hostDisplayName: string | null;
    date: Date;
    meetingType: MeetingType;
    category: MeetingCategory;
    attendeeCount: number;
  }>;
  workshopsOverview: Array<{
    id: string;
    title: string;
    mentorDisplayName: string;
    date: Date;
    meetingType: MeetingType;
    category: WorkshopCategory;
    maxAttendees: number | null;
    registrationCount: number;
  }>;
  reports: Array<{
    id: string;
    type: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
    createdAt: Date;
  }>;
}

export const dashboardService = {
  async getStudentDashboard(
    userId: string,
    anonymousIdentityId: string
  ): Promise<StudentDashboardData> {
    const [
      currentEmotion,
      upcomingMeetings,
      upcomingWorkshops,
      resourcesPreview,
      activeChats,
      recentDiscussions,
      announcements,
    ] = await Promise.all([
      emotionService.getLatestEmotion(anonymousIdentityId),
      meetingService.getUpcomingMeetingsForStudent(anonymousIdentityId),
      meetingService.getUpcomingWorkshopsForStudent(anonymousIdentityId),
      resourceService.getResources(1, 6, {}),
      chatService.getChats(userId, 'STUDENT' as Role, { page: 1, limit: 10 }),
      postService.getPosts({ page: 1, limit: 10 }),
      this.getAnnouncements(5),
    ]);

    const formattedMeetings = upcomingMeetings.meetings.map(m => ({
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
      hostDisplayName: m.hostDisplayName,
      isAttending: m.isAttending,
    }));

    const formattedWorkshops = upcomingWorkshops.workshops.map(w => ({
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
      mentorDisplayName: w.mentorDisplayName,
      registrationStatus: w.userRegistrationStatus,
    }));

    const formattedResources = resourcesPreview.resources.slice(0, 6).map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      link: r.link,
    }));

    const formattedChats = activeChats.chats.map(c => ({
      id: c.id,
      studentIdentityId: c.studentIdentityId,
      mentorId: c.mentorId,
      status: c.status,
      createdAt: c.createdAt,
      studentDisplayName: c.studentIdentity.displayName,
      mentorDisplayName: c.mentor ? `Mentor` : null,
      unreadCount: c._count.messages,
      lastMessage: c.messages[0]
        ? { body: c.messages[0].body, createdAt: c.messages[0].createdAt }
        : null,
    }));

    const formattedDiscussions = recentDiscussions.posts.map(p => ({
      id: p.id,
      title: p.title,
      body: p.body,
      category: p.category as PostCategory,
      emotion: p.emotion as EmotionType | null,
      urgencyLevel: p.urgencyLevel as UrgencyLevel | null,
      createdAt: p.createdAt,
      anonymousDisplayName: p.anonymousIdentity.displayName,
      replyCount: p._count.replies,
    }));

    return {
      currentEmotion: currentEmotion
        ? {
            emotion: currentEmotion.emotion,
            urgencyLevel: currentEmotion.urgencyLevel,
            createdAt: currentEmotion.createdAt,
          }
        : null,
      upcomingMeetings: formattedMeetings,
      upcomingWorkshops: formattedWorkshops,
      resourcesPreview: formattedResources,
      activeChats: formattedChats,
      recentDiscussions: formattedDiscussions,
      announcements,
    };
  },

  async getMentorDashboard(userId: string): Promise<MentorDashboardData> {
    const [
      waitingChats,
      assignedStudents,
      emotionTrends,
      todaysMeetings,
      todaysWorkshops,
      mentorProfile,
      recentDiscussions,
      announcements,
    ] = await Promise.all([
      this.getWaitingChats(),
      this.getAssignedStudents(userId),
      emotionService.getEmotionTrends({ hours: 24 }),
      meetingService.getTodaysMeetingsForMentor(userId),
      meetingService.getTodaysWorkshopsForMentor(userId),
      mentorService.getMentorProfile(userId),
      postService.getPosts({ page: 1, limit: 10 }),
      this.getAnnouncements(5),
    ]);

    const waitingChatsWithEmotion = await Promise.all(
      waitingChats.map(async chat => {
        const latestEmotion = await chatService.getStudentLatestEmotion(chat.studentIdentityId);
        return {
          id: chat.id,
          studentIdentityId: chat.studentIdentityId,
          status: chat.status,
          createdAt: chat.createdAt,
          studentDisplayName: chat.studentIdentity.displayName,
          studentAvatarSeed: chat.studentIdentity.avatarSeed,
          latestEmotion: latestEmotion
            ? {
                emotion: latestEmotion.emotion,
                urgencyLevel: latestEmotion.urgencyLevel,
                createdAt: latestEmotion.createdAt,
              }
            : null,
        };
      })
    );

    const assignedStudentsWithEmotion = await Promise.all(
      assignedStudents.chats.map(async chat => {
        const latestEmotion = await chatService.getStudentLatestEmotion(chat.studentIdentityId);
        return {
          id: chat.id,
          studentIdentityId: chat.studentIdentityId,
          studentDisplayName: chat.studentIdentity.displayName,
          studentAvatarSeed: chat.studentIdentity.avatarSeed,
          status: chat.status,
          createdAt: chat.createdAt,
          latestEmotion: latestEmotion
            ? {
                emotion: latestEmotion.emotion,
                urgencyLevel: latestEmotion.urgencyLevel,
                createdAt: latestEmotion.createdAt,
              }
            : null,
          unreadCount: chat._count.messages,
          lastMessage: chat.messages[0]
            ? { body: chat.messages[0].body, createdAt: chat.messages[0].createdAt }
            : null,
        };
      })
    );

    const priorityStudents = await this.getPriorityStudents();

    const formattedMeetings = todaysMeetings.meetings.map(m => ({
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
      attendeeCount: m.attendeeCount,
      isHost: m.isHost,
    }));

    const formattedWorkshops = todaysWorkshops.workshops.map(w => ({
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
      registrationCount: w.registrationCount,
    }));

    const formattedDiscussions = recentDiscussions.posts.map(p => ({
      id: p.id,
      title: p.title,
      body: p.body,
      category: p.category as PostCategory,
      emotion: p.emotion as EmotionType | null,
      urgencyLevel: p.urgencyLevel as UrgencyLevel | null,
      createdAt: p.createdAt,
      anonymousDisplayName: p.anonymousIdentity.displayName,
      replyCount: p._count.replies,
    }));

    return {
      waitingChats: waitingChatsWithEmotion,
      assignedStudents: assignedStudentsWithEmotion,
      studentEmotionOverview: {
        windowHours: emotionTrends.windowHours,
        totalLogs: emotionTrends.totalLogs,
        emotionCounts: emotionTrends.emotionCounts,
        urgencyCounts: emotionTrends.urgencyCounts,
        emotionUrgencyBreakdown: emotionTrends.emotionUrgencyBreakdown,
        priorityStudents,
      },
      todaysMeetings: formattedMeetings,
      todaysWorkshops: formattedWorkshops,
      mentorAvailability: mentorProfile?.availabilityStatus || MentorAvailabilityStatus.OFFLINE,
      recentDiscussions: formattedDiscussions,
      announcements,
    };
  },

  async getAdminDashboard(): Promise<AdminDashboardData> {
    const [
      platformStats,
      activeStudents,
      activeMentors,
      meetingsOverview,
      workshopsOverview,
      reports,
    ] = await Promise.all([
      this.getPlatformStats(),
      this.getActiveStudents(),
      this.getActiveMentors(),
      this.getMeetingsOverview(),
      this.getWorkshopsOverview(),
      this.getReports(),
    ]);

    return {
      platformStats,
      activeStudents,
      activeMentors,
      meetingsOverview,
      workshopsOverview,
      reports,
    };
  },

  async getAnnouncements(limit: number) {
    return [
      {
        id: '1',
        title: 'Welcome to Campus Peer Support',
        body: 'This platform is designed to provide confidential, anonymous support for first-year students.',
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'New Resources Available',
        body: 'Check out the updated Resource Hub with new self-help guides and emergency contacts.',
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: '3',
        title: 'Mentor Office Hours This Week',
        body: 'Several mentors are hosting office hours. Browse the Meetings section to join.',
        createdAt: new Date(Date.now() - 172800000),
      },
    ].slice(0, limit);
  },

  async getWaitingChats() {
    return prisma.chatThread.findMany({
      where: {
        mentorId: null,
        status: ChatStatus.ACTIVE,
      },
      include: {
        studentIdentity: {
          select: { displayName: true, avatarSeed: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });
  },

  async getAssignedStudents(mentorId: string) {
    return chatService.getChats(mentorId, 'MENTOR' as Role, { page: 1, limit: 20 });
  },

  async getPriorityStudents() {
    const priorityEmotions: EmotionType[] = [
      'OVERWHELMED',
      'ANXIOUS',
      'SCARED',
      'STRESSED',
      'BURNT_OUT',
      'HOMESICK',
      'LONELY',
    ];

    const studentsWithPriorityEmotions = await prisma.chatThread.findMany({
      where: {
        status: ChatStatus.ACTIVE,
        mentorId: { not: null },
      },
      include: {
        studentIdentity: {
          select: { id: true, displayName: true, avatarSeed: true },
        },
      },
      take: 50,
    });

    const priorityStudents = [];
    for (const chat of studentsWithPriorityEmotions) {
      const latestEmotion = await chatService.getStudentLatestEmotion(chat.studentIdentityId);
      if (latestEmotion && priorityEmotions.includes(latestEmotion.emotion)) {
        priorityStudents.push({
          studentIdentityId: chat.studentIdentityId,
          studentDisplayName: chat.studentIdentity.displayName,
          latestEmotion: latestEmotion.emotion,
          latestUrgency: latestEmotion.urgencyLevel,
          chatId: chat.id,
        });
      }
      if (priorityStudents.length >= 10) break;
    }

    return priorityStudents;
  },

  async getPlatformStats() {
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

  async getActiveStudents() {
    const students = await prisma.user.findMany({
      where: { role: PrismaRole.STUDENT, isActive: true },
      include: {
        anonymousIdentity: {
          select: { displayName: true, avatarSeed: true },
          include: {
            _count: {
              select: { posts: { where: { isDeleted: false } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const result = [];
    for (const student of students) {
      const anonId = student.anonymousIdentity?.id;
      if (!anonId) continue;

      const lastEmotion = await prisma.emotionLog.findFirst({
        where: { anonymousIdentityId: anonId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
      const activeChats = await prisma.chatThread.count({
        where: { studentIdentityId: anonId, status: ChatStatus.ACTIVE },
      });
      const postCount = student.anonymousIdentity?._count?.posts ?? 0;
      result.push({
        id: student.id,
        anonymousDisplayName: student.anonymousIdentity?.displayName || 'Anonymous',
        createdAt: student.createdAt,
        lastEmotionAt: lastEmotion?.createdAt || null,
        postCount,
        activeChats,
      });
    }
    return result;
  },

  async getActiveMentors() {
    const mentors = await prisma.user.findMany({
      where: { role: PrismaRole.MENTOR, isActive: true },
      include: {
        anonymousIdentity: { select: { displayName: true } },
        mentorProfile: {
          select: {
            department: true,
            availabilityStatus: true,
            lastSeenAt: true,
          },
        },
        _count: {
          select: {
            chatThreads: { where: { status: ChatStatus.ACTIVE } },
            meetings: true,
            workshops: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return mentors.map(m => ({
      id: m.id,
      displayName: m.anonymousIdentity?.displayName || 'Unknown Mentor',
      department: m.mentorProfile?.department || '',
      isVerifiedMentor: m.isVerifiedMentor,
      availabilityStatus: m.mentorProfile?.availabilityStatus || MentorAvailabilityStatus.OFFLINE,
      activeChats: m._count.chatThreads,
      hostedMeetings: m._count.meetings,
      hostedWorkshops: m._count.workshops,
      lastSeenAt: m.mentorProfile?.lastSeenAt || null,
    }));
  },

  async getMeetingsOverview() {
    const meetings = await prisma.meeting.findMany({
      include: {
        hostIdentity: { select: { displayName: true } },
        hostUser: {
          include: {
            anonymousIdentity: { select: { displayName: true } },
          },
        },
        _count: { select: { attendees: true } },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    return meetings.map(m => ({
      id: m.id,
      title: m.title,
      hostType: m.hostType,
      hostDisplayName:
        m.hostType === MeetingHostType.STUDENT
          ? (m.hostIdentity?.displayName ?? null)
          : (m.hostUser?.anonymousIdentity?.displayName ?? null),
      date: m.date,
      meetingType: m.meetingType,
      category: m.category,
      attendeeCount: m._count.attendees,
    }));
  },

  async getWorkshopsOverview() {
    const workshops = await prisma.workshop.findMany({
      include: {
        mentor: {
          include: {
            anonymousIdentity: { select: { displayName: true } },
          },
        },
        _count: { select: { registrations: true } },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    return workshops.map(w => ({
      id: w.id,
      title: w.title,
      mentorDisplayName: w.mentor.anonymousIdentity?.displayName || 'Unknown Mentor',
      date: w.date,
      meetingType: w.meetingType,
      category: w.category,
      maxAttendees: w.maxAttendees,
      registrationCount: w._count.registrations,
    }));
  },

  async getReports() {
    return [
      {
        id: '1',
        type: 'CONTENT_FLAG',
        targetType: 'POST',
        targetId: 'post_123',
        reason: 'Inappropriate content',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        type: 'CHAT_CONCERN',
        targetType: 'CHAT',
        targetId: 'chat_456',
        reason: 'Student expressing self-harm ideation',
        status: 'IN_REVIEW',
        createdAt: new Date(Date.now() - 7200000),
      },
    ];
  },

  async updateMentorAvailability(userId: string, availabilityStatus: string) {
    const { mentorService } = await import('./mentor.service.js');

    return mentorService.updateAvailability(userId, availabilityStatus as any);
  },
};
