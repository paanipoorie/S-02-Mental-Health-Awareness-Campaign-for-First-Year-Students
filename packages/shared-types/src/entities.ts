import type {
  Role,
  EmotionType,
  UrgencyLevel,
  EmotionContext,
  PostCategory,
  ChatStatus,
  MeetingType,
  MeetingHostType,
  MeetingCategory,
  WorkshopCategory,
  MentorAvailabilityStatus,
  WorkshopRegistrationStatus,
  ResourceCategory,
} from './enums.js';

/**
 * Base entity fields shared across all models.
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User entity (matches Prisma User model).
 */
export interface User extends BaseEntity {
  universityEmail: string;
  passwordHash: string;
  role: Role;
  isVerifiedMentor: boolean;
  isActive: boolean;
}

/**
 * Anonymous identity for students (matches Prisma AnonymousIdentity model).
 * This is the ONLY identity exposed to other students/mentors in feature tables.
 */
export interface AnonymousIdentity extends BaseEntity {
  userId: string;
  displayName: string; // e.g., "Anonymous Sparrow"
  avatarSeed: string;
}

/**
 * Emotion log entry (matches Prisma EmotionLog model).
 */
export interface EmotionLog extends BaseEntity {
  anonymousIdentityId: string;
  emotion: EmotionType;
  urgencyLevel: UrgencyLevel | null;
  context: EmotionContext;
}

/**
 * Post entity (matches Prisma Post model).
 */
export interface Post extends BaseEntity {
  anonymousIdentityId: string;
  title: string;
  body: string;
  category: PostCategory;
  emotion: EmotionType | null;
  urgencyLevel: UrgencyLevel | null;
  isDeleted: boolean;
}

/**
 * Post reply entity (matches Prisma PostReply model).
 */
export interface PostReply extends BaseEntity {
  postId: string;
  anonymousIdentityId: string;
  body: string;
  isDeleted: boolean;
}

/**
 * Chat thread entity (matches Prisma ChatThread model).
 */
export interface ChatThread extends BaseEntity {
  studentIdentityId: string;
  mentorId: string | null;
  status: ChatStatus;
}

/**
 * Chat message entity (matches Prisma ChatMessage model).
 */
export interface ChatMessage extends BaseEntity {
  chatThreadId: string;
  senderType: 'ANONYMOUS_IDENTITY' | 'MENTOR';
  senderId: string;
  body: string;
  readAt: Date | null;
}

/**
 * Meeting entity (matches Prisma Meeting model).
 */
export interface Meeting extends BaseEntity {
  title: string;
  description: string;
  hostType: MeetingHostType;
  hostIdentityId: string | null; // for student hosts
  hostUserId: string | null; // for mentor hosts
  date: Date;
  time: string; // HH:mm format
  durationMinutes: number;
  meetingType: MeetingType;
  meetingLink: string | null;
  location: string | null;
  category: MeetingCategory;
}

/**
 * Meeting attendee entity (matches Prisma MeetingAttendee model).
 */
export interface MeetingAttendee extends BaseEntity {
  meetingId: string;
  anonymousIdentityId: string;
  joinedAt: Date | null;
}

/**
 * Workshop entity (matches Prisma Workshop model).
 */
export interface Workshop extends BaseEntity {
  title: string;
  description: string;
  mentorId: string;
  date: Date;
  time: string; // HH:mm format
  durationMinutes: number;
  meetingType: MeetingType;
  meetingLink: string | null;
  location: string | null;
  category: WorkshopCategory;
  maxAttendees: number | null;
  resources: string | null; // JSON/text for post-workshop materials
}

/**
 * Workshop registration entity (matches Prisma WorkshopRegistration model).
 */
export interface WorkshopRegistration extends BaseEntity {
  workshopId: string;
  anonymousIdentityId: string;
  status: WorkshopRegistrationStatus;
  registeredAt: Date;
  attendedAt: Date | null;
}

/**
 * Mentor profile entity (matches Prisma MentorProfile model).
 */
export interface MentorProfile extends BaseEntity {
  userId: string;
  department: string;
  bio: string;
  specialties: string[];
  availabilityStatus: MentorAvailabilityStatus;
  lastSeenAt: Date | null;
}

/**
 * Resource entity (matches Prisma Resource model).
 */
export interface Resource extends BaseEntity {
  title: string;
  description: string;
  category: ResourceCategory;
  content: string; // text or JSON
  link: string | null;
  isActive: boolean;
}

/**
 * Admin action log entity (matches Prisma AdminActionLog model).
 */
export interface AdminActionLog extends BaseEntity {
  adminUserId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  notes: string | null;
}

/**
 * API response wrapper for consistent error/success handling.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Pagination parameters for list endpoints.
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * JWT payload structure.
 */
export interface JwtPayload {
  userId: string;
  role: Role;
  email: string;
}

/**
 * Authenticated request user (attached by auth middleware).
 */
export interface AuthUser {
  userId: string;
  role: Role;
  email: string;
}
