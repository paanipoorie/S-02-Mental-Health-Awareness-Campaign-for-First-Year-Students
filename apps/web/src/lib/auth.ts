import { Role } from '@campus-peer-support/shared-types';

export interface UserProfile {
  id?: string;
  userId?: string;
  role: Role;
  email?: string;
  anonymousDisplayName?: string;
  avatarSeed?: string;
  name?: string;
  isVerifiedMentor?: boolean;
  department?: string;
}

const ACCESS_TOKEN_KEY = 'caps_access_token';
const USER_KEY = 'caps_user_profile';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

export function clearAuthSession(): void {
  removeAccessToken();
  removeStoredUser();
}

export const MENTOR_VERIFICATION_PENDING_PATH = '/mentor/verification-pending';

/**
 * A mentor whose account has not yet been approved by an admin.
 * They can log in and view the pending-verification page only.
 */
export function isUnverifiedMentor(user: UserProfile | null): boolean {
  return (
    !!user &&
    user.role === Role.MENTOR &&
    user.isVerifiedMentor !== true
  );
}

/**
 * Redirects an unverified mentor to the single "Verification Pending" page.
 * This is the single destination for all restricted mentor routes.
 */
export function redirectUnverifiedMentor(user: UserProfile | null): void {
  if (isUnverifiedMentor(user)) {
    window.location.href = MENTOR_VERIFICATION_PENDING_PATH;
  }
}

/** Client-side guard for pages/actions that require a verified mentor. */
export function requireVerifiedMentorRedirect(user: UserProfile | null): boolean {
  const unverified = isUnverifiedMentor(user);
  if (unverified) {
    window.location.href = MENTOR_VERIFICATION_PENDING_PATH;
  }
  return unverified;
}
