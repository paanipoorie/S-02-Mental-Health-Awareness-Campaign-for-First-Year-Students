import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $isAuthenticated, $isLoading, fetchCurrentUser } from '../../stores/authStore';
import { Role } from '@campus-peer-support/shared-types';

interface AuthGuardProps {
  allowedRoles?: Role[];
  requireVerifiedMentor?: boolean;
  children: React.ReactNode;
  redirectTo?: string;
}

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
      setChecking(false);
    }
    checkAuth();
  }, []);

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

  if (requireVerifiedMentor && user.role === Role.MENTOR && !user.isVerifiedMentor) {
    return (
      <div className="mx-auto my-12 max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-amber-300">Verification Pending</h2>
        <p className="mb-4 text-sm text-slate-300">
          Your mentor profile is awaiting administrative verification before you can access peer
          support features.
        </p>
        <a
          href="/mentor/dashboard"
          className="inline-block rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Back to Mentor Profile
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
