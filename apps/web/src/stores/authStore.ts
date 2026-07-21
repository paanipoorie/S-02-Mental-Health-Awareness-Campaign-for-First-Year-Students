import { atom } from 'nanostores';
import { getStoredUser, setStoredUser, clearAuthSession, type UserProfile } from '../lib/auth';
import { api } from '../lib/api';

export const $user = atom<UserProfile | null>(getStoredUser());
export const $isAuthenticated = atom<boolean>(!!getStoredUser());
export const $isLoading = atom<boolean>(false);

export function setAuthUser(user: UserProfile, token?: string): void {
  if (token) {
    import('../lib/auth').then(({ setAccessToken }) => setAccessToken(token));
  }
  setStoredUser(user);
  $user.set(user);
  $isAuthenticated.set(true);
}

export function clearAuthUser(): void {
  clearAuthSession();
  $user.set(null);
  $isAuthenticated.set(false);
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  $isLoading.set(true);
  try {
    const profile = await api.get<UserProfile>('/auth/me');
    setAuthUser(profile);
    return profile;
  } catch (error) {
    clearAuthUser();
    return null;
  } finally {
    $isLoading.set(false);
  }
}
