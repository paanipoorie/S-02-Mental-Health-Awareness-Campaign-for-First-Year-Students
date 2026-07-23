/**
 * Shared enums for the Campus Anonymous Peer Support Platform.
 */
/**
 * User roles in the platform.
 * STUDENT: First-year students seeking support (anonymous)
 * MENTOR: Verified mentors providing support
 * ADMIN: Platform administrators
 */
export var Role;
(function (Role) {
    Role["STUDENT"] = "STUDENT";
    Role["MENTOR"] = "MENTOR";
    Role["ADMIN"] = "ADMIN";
})(Role || (Role = {}));
/**
 * Emotion types that students can log.
 * Fixed enum - 10 emotions as specified in Phase 4.
 */
export var EmotionType;
(function (EmotionType) {
    EmotionType["HAPPY"] = "HAPPY";
    EmotionType["EXCITED"] = "EXCITED";
    EmotionType["CONFUSED"] = "CONFUSED";
    EmotionType["HOMESICK"] = "HOMESICK";
    EmotionType["LONELY"] = "LONELY";
    EmotionType["SCARED"] = "SCARED";
    EmotionType["ANXIOUS"] = "ANXIOUS";
    EmotionType["BURNT_OUT"] = "BURNT_OUT";
    EmotionType["OVERWHELMED"] = "OVERWHELMED";
    EmotionType["STRESSED"] = "STRESSED";
})(EmotionType || (EmotionType = {}));
/**
 * Urgency level for emotional states and posts.
 * Helps mentors prioritize without making medical judgments.
 */
export var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["LOW"] = "LOW";
    UrgencyLevel["MEDIUM"] = "MEDIUM";
    UrgencyLevel["HIGH"] = "HIGH";
})(UrgencyLevel || (UrgencyLevel = {}));
/**
 * Context in which an emotion was logged.
 */
export var EmotionContext;
(function (EmotionContext) {
    EmotionContext["POST"] = "POST";
    EmotionContext["CHAT"] = "CHAT";
    EmotionContext["STANDALONE"] = "STANDALONE";
})(EmotionContext || (EmotionContext = {}));
/**
 * Categories for anonymous posts.
 */
export var PostCategory;
(function (PostCategory) {
    PostCategory["ACADEMICS"] = "ACADEMICS";
    PostCategory["HOSTEL"] = "HOSTEL";
    PostCategory["HOMESICKNESS"] = "HOMESICKNESS";
    PostCategory["FRIENDS"] = "FRIENDS";
    PostCategory["RELATIONSHIPS"] = "RELATIONSHIPS";
    PostCategory["TIME_MANAGEMENT"] = "TIME_MANAGEMENT";
    PostCategory["EXAMS"] = "EXAMS";
    PostCategory["SLEEP"] = "SLEEP";
    PostCategory["CLUBS"] = "CLUBS";
    PostCategory["FINANCIAL"] = "FINANCIAL";
    PostCategory["GENERAL"] = "GENERAL";
})(PostCategory || (PostCategory = {}));
/**
 * Status of a chat thread.
 */
export var ChatStatus;
(function (ChatStatus) {
    ChatStatus["ACTIVE"] = "ACTIVE";
    ChatStatus["CLOSED"] = "CLOSED";
})(ChatStatus || (ChatStatus = {}));
/**
 * Type of meeting (online or offline).
 */
export var MeetingType;
(function (MeetingType) {
    MeetingType["ONLINE"] = "ONLINE";
    MeetingType["OFFLINE"] = "OFFLINE";
})(MeetingType || (MeetingType = {}));
/**
 * Who can host a meeting.
 */
export var MeetingHostType;
(function (MeetingHostType) {
    MeetingHostType["STUDENT"] = "STUDENT";
    MeetingHostType["MENTOR"] = "MENTOR";
})(MeetingHostType || (MeetingHostType = {}));
/**
 * Category for meetings.
 */
export var MeetingCategory;
(function (MeetingCategory) {
    MeetingCategory["STUDY_GROUP"] = "STUDY_GROUP";
    MeetingCategory["PEER_DISCUSSION"] = "PEER_DISCUSSION";
    MeetingCategory["MENTOR_OFFICE_HOURS"] = "MENTOR_OFFICE_HOURS";
    MeetingCategory["SOCIAL"] = "SOCIAL";
    MeetingCategory["WORKSHOP"] = "WORKSHOP";
    MeetingCategory["GENERAL"] = "GENERAL";
})(MeetingCategory || (MeetingCategory = {}));
/**
 * Category for workshops.
 */
export var WorkshopCategory;
(function (WorkshopCategory) {
    WorkshopCategory["MENTAL_HEALTH"] = "MENTAL_HEALTH";
    WorkshopCategory["STRESS_MANAGEMENT"] = "STRESS_MANAGEMENT";
    WorkshopCategory["STUDY_SKILLS"] = "STUDY_SKILLS";
    WorkshopCategory["TIME_MANAGEMENT"] = "TIME_MANAGEMENT";
    WorkshopCategory["MINDFULNESS"] = "MINDFULNESS";
    WorkshopCategory["CAREER_GUIDANCE"] = "CAREER_GUIDANCE";
    WorkshopCategory["GENERAL"] = "GENERAL";
})(WorkshopCategory || (WorkshopCategory = {}));
/**
 * Mentor availability status.
 */
export var MentorAvailabilityStatus;
(function (MentorAvailabilityStatus) {
    MentorAvailabilityStatus["AVAILABLE"] = "AVAILABLE";
    MentorAvailabilityStatus["BUSY"] = "BUSY";
    MentorAvailabilityStatus["OFFLINE"] = "OFFLINE";
})(MentorAvailabilityStatus || (MentorAvailabilityStatus = {}));
/**
 * Workshop registration status.
 */
export var WorkshopRegistrationStatus;
(function (WorkshopRegistrationStatus) {
    WorkshopRegistrationStatus["REGISTERED"] = "REGISTERED";
    WorkshopRegistrationStatus["ATTENDED"] = "ATTENDED";
    WorkshopRegistrationStatus["CANCELLED"] = "CANCELLED";
})(WorkshopRegistrationStatus || (WorkshopRegistrationStatus = {}));
/**
 * Resource categories for the Resource Hub.
 */
export var ResourceCategory;
(function (ResourceCategory) {
    ResourceCategory["COUNSELING_CENTER"] = "COUNSELING_CENTER";
    ResourceCategory["EMERGENCY_CONTACTS"] = "EMERGENCY_CONTACTS";
    ResourceCategory["FACULTY_ADVISORS"] = "FACULTY_ADVISORS";
    ResourceCategory["STUDENT_WELFARE"] = "STUDENT_WELFARE";
    ResourceCategory["CAMPUS_CLUBS"] = "CAMPUS_CLUBS";
    ResourceCategory["SELF_HELP_PDFS"] = "SELF_HELP_PDFS";
    ResourceCategory["STRESS_MANAGEMENT"] = "STRESS_MANAGEMENT";
    ResourceCategory["SLEEP_HYGIENE"] = "SLEEP_HYGIENE";
    ResourceCategory["EXTERNAL_HELPLINES"] = "EXTERNAL_HELPLINES";
})(ResourceCategory || (ResourceCategory = {}));
//# sourceMappingURL=enums.js.map