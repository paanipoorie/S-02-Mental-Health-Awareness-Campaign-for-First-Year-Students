import React, { useState } from 'react';
import { api, ClientApiError } from '../../lib/api';
import { setAuthUser } from '../../stores/authStore';
import { Role } from '@campus-peer-support/shared-types';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    role: Role;
    isVerifiedMentor: boolean;
  };
}

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        universityEmail: email.trim().toLowerCase(),
        password,
      });

      // Fetch user profile after login
      const profile = await api.get<{
        role: Role;
        anonymousDisplayName?: string;
        avatarSeed?: string;
        name?: string;
        isVerifiedMentor?: boolean;
      }>('/auth/me', {
        headers: { Authorization: `Bearer ${res.accessToken}` },
      });

      setAuthUser(profile, res.accessToken);

      // Redirect based on role
      if (profile.role === Role.STUDENT) {
        window.location.href = '/dashboard';
      } else if (profile.role === Role.MENTOR) {
        window.location.href = '/mentor/dashboard';
      } else if (profile.role === Role.ADMIN) {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      if (err instanceof ClientApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-sm border border-gray-200 bg-background-100 p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-heading-24 font-bold text-gray-1000">
          Sign In
        </h2>
        <p className="mt-1.5 text-label-13 text-gray-600">
          Access your peer support workspace anonymously.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-sm border border-red-300 bg-red-100/50 p-4 text-label-13 text-red-800">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-label-13 font-semibold text-gray-700">
            University Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="university@college.edu"
            className="w-full h-10 px-3 py-2 text-label-14 bg-background-100 text-primary border border-gray-300 rounded-sm focus-visible:outline-none focus-visible:border-blue-700 placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-label-13 font-semibold text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-10 px-3 py-2 text-label-14 bg-background-100 text-primary border border-gray-300 rounded-sm focus-visible:outline-none focus-visible:border-blue-700 placeholder-gray-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-button-14 font-semibold text-background-100 transition-colors hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background-100/30 border-t-background-100"></div>
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-gray-200 pt-6 text-center">
        <p className="text-label-13 text-gray-600">
          Don't have an account yet?{' '}
          <a href="/register" className="ml-1 font-semibold text-tertiary hover:underline">
            Register now
          </a>
        </p>
      </div>
    </div>
  );
};
