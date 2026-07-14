/**
 * Shared enums for the Campus Anonymous Peer Support Platform.
 */

/**
 * User roles in the platform.
 * STUDENT: First-year students seeking support (anonymous)
 * MENTOR: Verified mentors providing support
 * ADMIN: Platform administrators
 */
export enum Role {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
  ADMIN = 'ADMIN',
}

/**
 * Emotion types that students can log.
 * Fixed enum - 10 emotions as specified in Phase 4.
 */
export enum EmotionType {
  HAPPY = 'HAPPY',
  EXCITED = 'EXCITED',
  CONFUSED = 'CONFUSED',
  HOMESICK = 'HOMESICK',
  LONELY = 'LONELY',
  SCARED = 'SCARED',
  ANXIOUS = 'ANXIOUS',
  BURNT_OUT = 'BURNT_OUT',
  OVERWHELMED = 'OVERWHELMED',
  STRESSED = 'STRESSED',
}

/**
 * Urgency level for emotional states and posts.
 * Helps mentors prioritize without making medical judgments.
 */
export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * Context in which an emotion was logged.
 */
export enum EmotionContext {
  POST = 'POST',
  CHAT = 'CHAT',
  STANDALONE = 'STANDALONE',
}

/**
 * Categories for anonymous posts.
 */
export enum PostCategory {
  ACADEMICS = 'ACADEMICS',
  HOSTEL = 'HOSTEL',
  HOMESICKNESS = 'HOMESICKNESS',
  FRIENDS = 'FRIENDS',
  RELATIONSHIPS = 'RELATIONSHIPS',
  TIME_MANAGEMENT = 'TIME_MANAGEMENT',
  EXAMS = 'EXAMS',
  SLEEP = 'SLEEP',
  CLUBS = 'CLUBS',
  FINANCIAL = 'FINANCIAL',
  GENERAL = 'GENERAL',
}

/**
 * Status of a chat thread.
 */
export enum ChatStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

/**
 * Type of meeting (online or offline).
 */
export enum MeetingType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

/**
 * Who can host a meeting.
 */
export enum MeetingHostType {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
}

/**
 * Category for meetings.
 */
export enum MeetingCategory {
  STUDY_GROUP = 'STUDY_GROUP',
  PEER_DISCUSSION = 'PEER_DISCUSSION',
  MENTOR_OFFICE_HOURS = 'MENTOR_OFFICE_HOURS',
  SOCIAL = 'SOCIAL',
  WORKSHOP = 'WORKSHOP',
  GENERAL = 'GENERAL',
}

/**
 * Category for workshops.
 */
export enum WorkshopCategory {
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  STRESS_MANAGEMENT = 'STRESS_MANAGEMENT',
  STUDY_SKILLS = 'STUDY_SKILLS',
  TIME_MANAGEMENT = 'TIME_MANAGEMENT',
  MINDFULNESS = 'MINDFULNESS',
  CAREER_GUIDANCE = 'CAREER_GUIDANCE',
  GENERAL = 'GENERAL',
}

/**
 * Mentor availability status.
 */
export enum MentorAvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

/**
 * Workshop registration status.
 */
export enum WorkshopRegistrationStatus {
  REGISTERED = 'REGISTERED',
  ATTENDED = 'ATTENDED',
  CANCELLED = 'CANCELLED',
}

/**
 * Resource categories for the Resource Hub.
 */
export enum ResourceCategory {
  COUNSELING_CENTER = 'COUNSELING_CENTER',
  EMERGENCY_CONTACTS = 'EMERGENCY_CONTACTS',
  FACULTY_ADVISORS = 'FACULTY_ADVISORS',
  STUDENT_WELFARE = 'STUDENT_WELFARE',
  CAMPUS_CLUBS = 'CAMPUS_CLUBS',
  SELF_HELP_PDFS = 'SELF_HELP_PDFS',
  STRESS_MANAGEMENT = 'STRESS_MANAGEMENT',
  SLEEP_HYGIENE = 'SLEEP_HYGIENE',
  EXTERNAL_HELPLINES = 'EXTERNAL_HELPLINES',
}
