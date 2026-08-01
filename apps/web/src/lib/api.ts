import { getAccessToken, clearAuthSession } from './auth';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ClientApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ClientApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });

  if (
    response.status === 401 &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/register')
  ) {
    clearAuthSession();
  }

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new ClientApiError(
      response.status,
      'INVALID_RESPONSE',
      `HTTP ${response.status}: Failed to parse JSON response`
    );
  }

  if (!response.ok || !data.success) {
    const errorBody = data as ApiErrorResponse;
    throw new ClientApiError(
      response.status,
      errorBody.error?.code || 'UNKNOWN_ERROR',
      errorBody.error?.message || 'An error occurred',
      errorBody.error?.details
    );
  }

  if ('pagination' in data) {
    return {
      data: (data as any).data,
      pagination: (data as any).pagination,
    } as unknown as T;
  }

  return (data as ApiSuccessResponse<T>).data;
}

export const api = {
  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return apiFetch<T>(endpoint, { ...options, method: 'GET' });
  },
  post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export const notificationApi = {
  getNotifications(page: number = 1, limit: number = 20) {
    return api.get<{ data: any[]; unreadCount: number; pagination: any }>(`/notifications?page=${page}&limit=${limit}`);
  },
  getUnreadCount() {
    return api.get<{ unreadCount: number }>('/notifications/unread-count');
  },
  markAsRead(id: string) {
    return api.patch(`/notifications/${id}/read`);
  },
  markAllAsRead() {
    return api.patch('/notifications/read-all');
  },
};

export const dashboardApi = {
  getStudentDashboard(): Promise<StudentDashboardData> {
    return api.get('/dashboard/student');
  },
  getMentorDashboard(): Promise<MentorDashboardData> {
    return api.get('/dashboard/mentor');
  },
  getAdminDashboard(): Promise<AdminDashboardData> {
    return api.get('/dashboard/admin');
  },
  updateMentorAvailability(availabilityStatus: string): Promise<{ availabilityStatus: string }> {
    return api.patch('/dashboard/mentor/availability', { availabilityStatus });
  },
};

export const adminApi = {
  getStats(): Promise<AdminDashboardData['platformStats']> {
    return api.get('/admin/stats');
  },
  getUsers(query: { page: number; limit: number; role?: string; isActive?: boolean; search?: string }) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return api.get(`/admin/users?${params.toString()}`);
  },
  getMentors(query: { page: number; limit: number; isVerified?: boolean; availabilityStatus?: string; search?: string }) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return api.get(`/admin/mentors?${params.toString()}`);
  },
  updateUserStatus(userId: string, isActive: boolean) {
    return api.patch(`/admin/users/${userId}/status`, { isActive });
  },
  verifyMentor(mentorId: string, isVerified: boolean) {
    return api.patch(`/admin/mentors/${mentorId}/verify`, { isVerified });
  },
  getMeetings(query: { page: number; limit: number; hostType?: string; meetingType?: string; category?: string; upcoming?: boolean; search?: string }) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return api.get(`/admin/meetings?${params.toString()}`);
  },
  deleteMeeting(meetingId: string) {
    return api.delete(`/admin/meetings/${meetingId}`);
  },
  getWorkshops(query: { page: number; limit: number; meetingType?: string; category?: string; upcoming?: boolean; search?: string }) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return api.get(`/admin/workshops?${params.toString()}`);
  },
  deleteWorkshop(workshopId: string) {
    return api.delete(`/admin/workshops/${workshopId}`);
  },
  getResources(query: { page: number; limit: number; category?: string; isActive?: boolean; search?: string }) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return api.get(`/admin/resources?${params.toString()}`);
  },
  createResource(data: { title: string; description: string; category: string; content: string; link?: string | null; isActive: boolean }) {
    return api.post('/admin/resources', data);
  },
  updateResource(resourceId: string, data: { title?: string; description?: string; category?: string; content?: string; link?: string | null; isActive?: boolean }) {
    return api.patch(`/admin/resources/${resourceId}`, data);
  },
  deleteResource(resourceId: string) {
    return api.delete(`/admin/resources/${resourceId}`);
  },
  getActionLogs(query: { page: number; limit: number; adminUserId?: string; actionType?: string; targetType?: string }) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    return api.get(`/admin/action-logs?${params.toString()}`);
  },
};

export interface StudentDashboardData {
  currentEmotion: {
    emotion: string | null;
    urgencyLevel: string | null;
    createdAt: string | null;
  } | null;
  upcomingMeetings: Array<{
    id: string;
    title: string;
    description: string;
    hostType: string;
    date: string;
    time: string;
    durationMinutes: number;
    meetingType: string;
    meetingLink: string | null;
    location: string | null;
    category: string;
    hostDisplayName: string | null;
    isAttending: boolean;
  }>;
  upcomingWorkshops: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    durationMinutes: number;
    meetingType: string;
    meetingLink: string | null;
    location: string | null;
    category: string;
    mentorDisplayName: string;
    registrationStatus: string;
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
    status: string;
    createdAt: string;
    studentDisplayName: string;
    mentorDisplayName: string | null;
    unreadCount: number;
    lastMessage: { body: string; createdAt: string } | null;
  }>;
  recentDiscussions: Array<{
    id: string;
    title: string;
    body: string;
    category: string;
    emotion: string | null;
    urgencyLevel: string | null;
    createdAt: string;
    anonymousDisplayName: string;
    replyCount: number;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
  }>;
  assignedMentor: {
    id: string;
    displayName: string;
    availabilityStatus: string;
    isVerifiedMentor: boolean;
    chatThreadId: string | null;
  } | null;
}

export interface MentorDashboardData {
  waitingChats: Array<{
    id: string;
    studentIdentityId: string;
    status: string;
    createdAt: string;
    studentDisplayName: string;
    studentAvatarSeed: number;
    latestEmotion: {
      emotion: string;
      urgencyLevel: string | null;
      createdAt: string;
    } | null;
  }>;
  assignedStudents: Array<{
    id: string;
    studentIdentityId: string;
    studentDisplayName: string;
    studentAvatarSeed: number;
    status: string;
    createdAt: string;
    latestEmotion: {
      emotion: string;
      urgencyLevel: string | null;
      createdAt: string;
    } | null;
    unreadCount: number;
    lastMessage: { body: string; createdAt: string } | null;
  }>;
  studentEmotionOverview: {
    windowHours: number;
    totalLogs: number;
    emotionCounts: Record<string, number>;
    urgencyCounts: Record<string, number>;
    emotionUrgencyBreakdown: Record<string, Record<string, number>>;
    priorityStudents: Array<{
      studentIdentityId: string;
      studentDisplayName: string;
      latestEmotion: string;
      latestUrgency: string | null;
      chatId: string;
    }>;
  };
  todaysMeetings: Array<{
    id: string;
    title: string;
    description: string;
    hostType: string;
    date: string;
    time: string;
    durationMinutes: number;
    meetingType: string;
    meetingLink: string | null;
    location: string | null;
    category: string;
    attendeeCount: number;
    isHost: boolean;
  }>;
  todaysWorkshops: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    durationMinutes: number;
    meetingType: string;
    meetingLink: string | null;
    location: string | null;
    category: string;
    maxAttendees: number | null;
    registrationCount: number;
  }>;
  mentorAvailability: string;
  recentDiscussions: Array<{
    id: string;
    title: string;
    body: string;
    category: string;
    emotion: string | null;
    urgencyLevel: string | null;
    createdAt: string;
    anonymousDisplayName: string;
    replyCount: number;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
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
    createdAt: string;
    lastEmotionAt: string | null;
    postCount: number;
    activeChats: number;
  }>;
  activeMentors: Array<{
    id: string;
    displayName: string;
    department: string;
    isVerifiedMentor: boolean;
    availabilityStatus: string;
    activeChats: number;
    hostedMeetings: number;
    hostedWorkshops: number;
    lastSeenAt: string | null;
  }>;
  meetingsOverview: Array<{
    id: string;
    title: string;
    hostType: string;
    hostDisplayName: string | null;
    date: string;
    meetingType: string;
    category: string;
    attendeeCount: number;
  }>;
  workshopsOverview: Array<{
    id: string;
    title: string;
    mentorDisplayName: string;
    date: string;
    meetingType: string;
    category: string;
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
    createdAt: string;
  }>;
}

// Admin API Types
export interface AdminUser {
  id: string;
  universityEmail: string;
  role: string;
  isActive: boolean;
  isVerifiedMentor: boolean;
  createdAt: string;
  anonymousDisplayName: string | null;
  avatarSeed: number | null;
  department: string | null;
  bio: string | null;
  specialties: string[];
  availabilityStatus: string | null;
  lastSeenAt: string | null;
  _count: {
    posts: number;
    chatThreads: number;
    meetings: number;
    workshops: number;
  };
}

export interface AdminMeeting {
  id: string;
  title: string;
  description: string;
  hostType: string;
  hostDisplayName: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  category: string;
  attendeeCount: number;
  createdAt: string;
}

export interface AdminWorkshop {
  id: string;
  title: string;
  description: string;
  mentorId: string;
  mentorDisplayName: string;
  date: string;
  time: string;
  durationMinutes: number;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  category: string;
  maxAttendees: number | null;
  registrationCount: number;
  resources: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminResource {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  link: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminActionLog {
  id: string;
  adminUserId: string;
  adminUserEmail: string;
  adminUserDisplayName: string | null;
  actionType: string;
  targetType: string;
  targetId: string;
  notes: string | null;
  createdAt: string;
}

export interface AdminActionLogsResponse {
  logs: AdminActionLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
