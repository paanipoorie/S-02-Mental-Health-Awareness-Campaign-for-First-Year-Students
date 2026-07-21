import React, { useState } from 'react';
import { api, ClientApiError } from '../../lib/api';
import { setAuthUser } from '../../stores/authStore';
import { Role } from '@campus-peer-support/shared-types';

interface LoginResponse {
  accessToken: string;
  role: Role;
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
        universityEmail: email,
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
      if (res.role === Role.STUDENT) {
        window.location.href = '/dashboard';
      } else if (res.role === Role.MENTOR) {
        window.location.href = '/mentor/dashboard';
      } else if (res.role === Role.ADMIN) {
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
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Sign in confidentially to access peer support & discussions
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            University Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 hover:from-teal-400 hover:to-purple-500 shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <a href="/register" className="text-teal-400 font-semibold hover:underline ml-1">
            Register now
          </a>
        </p>
      </div>
    </div>
  );
};
