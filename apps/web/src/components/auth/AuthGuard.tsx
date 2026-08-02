import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $isAuthenticated, $isLoading, fetchCurrentUser } from '../../stores/authStore';
import { Role } from '@campus-peer-support/shared-types';
import { MENTOR_VERIFICATION_PENDING_PATH, isUnverifiedMentor } from '../../lib/auth';

interface AuthGuardProps {
  allowedRoles?: Role[];
  requireVerifiedMentor?: boolean;
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Central authorization guard.
 *
 * - Unverified mentors are always sent to the single "Verification Pending" page.
 * - `requireVerifiedMentor` renders the professional pending state inline (and
 *   also redirects) so restricted mentor routes never expose UI to unverified mentors.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  allowedRoles,
  requireVerifiedMentor = false,
  children,
  redirectTo = '/login',
}) => {
  const user = useStore($user);
  const isAuthenticated = useStore($isAuthenticated);
  const isLoading = useStore($isLoading);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!isAuthenticated && !user) {
        const fetched = await fetchCurrentUser();
        if (!fetched) {
          window.location.href = `${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
      }

      // Unverified mentors are restricted to the pending page.
      if (isUnverifiedMentor(user)) {
        if (window.location.pathname !== MENTOR_VERIFICATION_PENDING_PATH) {
          window.location.href = MENTOR_VERIFICATION_PENDING_PATH;
          return;
        }
      }

      setChecking(false);
    }
    checkAuth();
  }, [user, isAuthenticated, redirectTo]);

  if (isLoading || checking) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-400"></div>
        <p className="text-sm font-medium text-slate-400">Verifying access rights...</p>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="mx-auto my-12 max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-rose-300">Access Denied</h2>
        <p className="mb-4 text-sm text-slate-300">
          You do not have permission to view this section.
        </p>
        <a
          href="/dashboard"
          className="inline-block rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  if (requireVerifiedMentor && isUnverifiedMentor(user)) {
    return (
      <div className="mx-auto my-12 w-full max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10">
          <svg
            className="h-7 w-7 text-amber-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-bold text-amber-300">Mentor Verification Pending</h2>
        <p className="mb-3 text-sm text-slate-300">
          Your mentor application is awaiting administrator approval.
        </p>
        <p className="mb-4 text-sm text-slate-300">
          You will gain access to mentoring features once your university verifies your account.
        </p>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
          </span>
          Status: Pending Approval
        </span>
      </div>
    );
  }

  return <>{children}</>;
};

