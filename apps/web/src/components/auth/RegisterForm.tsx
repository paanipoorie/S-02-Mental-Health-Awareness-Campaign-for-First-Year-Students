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
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
          Join Campus Sanctuary
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Create an account with your official university email
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
            I am registering as:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole(Role.STUDENT)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                role === Role.STUDENT
                  ? 'bg-teal-500/15 border-teal-400 text-teal-300 shadow-sm shadow-teal-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Student (Anonymous)
            </button>
            <button
              type="button"
              onClick={() => setRole(Role.MENTOR)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                role === Role.MENTOR
                  ? 'bg-purple-500/15 border-purple-400 text-purple-300 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Peer Mentor
            </button>
          </div>
        </div>

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
          <p className="text-[10px] text-slate-500 mt-1">Your email is only used for authentication and is never shown publicly.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
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
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="text-teal-400 font-semibold hover:underline ml-1">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};
