import React, { useState } from 'react';
import { api, ClientApiError } from '../../lib/api';
import { setAuthUser } from '../../stores/authStore';
import { Role } from '@campus-peer-support/shared-types';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        universityEmail: email,
        password,
        role,
      });

      // Auto login after registration
      const loginRes = await api.post<{ accessToken: string; role: Role }>('/auth/login', {
        universityEmail: email,
        password,
      });

      const profile = await api.get<{
        role: Role;
        anonymousDisplayName?: string;
        avatarSeed?: string;
        name?: string;
        isVerifiedMentor?: boolean;
      }>('/auth/me', {
        headers: { Authorization: `Bearer ${loginRes.accessToken}` },
      });

      setAuthUser(profile, loginRes.accessToken);

      if (role === Role.STUDENT) {
        window.location.href = '/dashboard';
      } else if (role === Role.MENTOR) {
        window.location.href = '/mentor/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      if (err instanceof ClientApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8 text-center">
        <h2 className="bg-gradient-to-r from-teal-300 via-indigo-200 to-purple-300 bg-clip-text text-2xl font-bold text-transparent">
          Join Campus Sanctuary
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Create an account with your official university email
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            I am registering as:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole(Role.STUDENT)}
              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                role === Role.STUDENT
                  ? 'border-teal-400 bg-teal-500/15 text-teal-300 shadow-sm shadow-teal-500/20'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Student (Anonymous)
            </button>
            <button
              type="button"
              onClick={() => setRole(Role.MENTOR)}
              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                role === Role.MENTOR
                  ? 'border-purple-400 bg-purple-500/15 text-purple-300 shadow-sm shadow-purple-500/20'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Peer Mentor
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            University Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="student@university.edu"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            required
          />
          <p className="mt-1 text-[10px] text-slate-500">
            Your email is only used for authentication and is never shown publicly.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-purple-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-slate-800/80 pt-6 text-center">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="ml-1 font-semibold text-teal-400 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};
