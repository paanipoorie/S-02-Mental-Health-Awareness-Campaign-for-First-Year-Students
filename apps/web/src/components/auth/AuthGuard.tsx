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
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Verifying access rights...</p>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
        <h2 className="text-lg font-bold text-rose-300 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-300 mb-4">
          You do not have permission to view this section.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  if (requireVerifiedMentor && user.role === Role.MENTOR && !user.isVerifiedMentor) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
        <h2 className="text-lg font-bold text-amber-300 mb-2">Verification Pending</h2>
        <p className="text-sm text-slate-300 mb-4">
          Your mentor profile is awaiting administrative verification before you can access peer support features.
        </p>
        <a
          href="/mentor/dashboard"
          className="inline-block px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
        >
          Back to Mentor Profile
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
