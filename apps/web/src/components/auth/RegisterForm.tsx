import React, { useState } from 'react';
import { api, ClientApiError } from '../../lib/api';
import { setAuthUser } from '../../stores/authStore';
import { Role } from '@campus-peer-support/shared-types';
import {
  MENTOR_VERIFICATION_PENDING_PATH,
} from '../../lib/auth';

const CU_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@cuchd\.in$/;

const EMAIL_ERROR_MESSAGE =
  'Please use your official Chandigarh University email (@cuchd.in).';

type RoleChoice = Role.STUDENT | Role.MENTOR;

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<RoleChoice>(Role.STUDENT);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1 = details, 2 = OTP verification
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (value: string): string | null => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return 'Please enter your university email.';
    if (!CU_EMAIL_REGEX.test(normalized)) return EMAIL_ERROR_MESSAGE;
    return null;
  };

  const mapFieldErrors = (details?: unknown): Record<string, string> => {
    if (!Array.isArray(details)) return {};
    const mapped: Record<string, string> = {};
    for (const item of details) {
      if (item && typeof item === 'object' && 'field' in item && 'message' in item) {
        const field = String(item.field);
        const message = String(item.message);
        if (field === 'universityEmail') mapped.email = message;
        else if (field === 'password') mapped.password = message;
        else if (field === 'role') mapped.role = message;
      }
    }
    return mapped;
  };

  const startResendCountdown = () => {
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setFieldErrors({});
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setFieldErrors({});
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setFieldErrors({});
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setFieldErrors({});
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', {
        universityEmail: email.trim().toLowerCase(),
        password,
        role,
      });
      setStep(2);
      startResendCountdown();
      setFieldErrors({});
      setError(null);
    } catch (err) {
      if (err instanceof ClientApiError) {
        if (err.code === 'VALIDATION_ERROR' && err.details) {
          setFieldErrors(mapFieldErrors(err.details));
          setError(null);
        } else if (err.statusCode === 500 || err.code === 'INTERNAL_SERVER_ERROR') {
          setError('An unexpected error occurred while sending the OTP.');
          setFieldErrors({});
        } else {
          setError(err.message);
          setFieldErrors({});
        }
      } else {
        setError('An unexpected error occurred while sending the OTP.');
        setFieldErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      setFieldErrors({});
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{
        accessToken: string;
        user: { role: Role; isVerifiedMentor: boolean };
      }>('/auth/verify-otp', {
        universityEmail: email.trim().toLowerCase(),
        otp,
      });

      // Fetch the full profile, then persist the session.
      const profile = await api.get<{
        role: Role;
        isVerifiedMentor?: boolean;
        anonymousDisplayName?: string;
        avatarSeed?: string;
      }>('/auth/me', {
        headers: { Authorization: `Bearer ${res.accessToken}` },
      });

      setAuthUser(profile, res.accessToken);

      if (profile.role === Role.STUDENT) {
        window.location.href = '/dashboard';
      } else if (profile.role === Role.MENTOR) {
        if (!profile.isVerifiedMentor) {
          window.location.href = MENTOR_VERIFICATION_PENDING_PATH;
        } else {
          window.location.href = '/mentor/dashboard';
        }
      } else if (profile.role === Role.ADMIN) {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      if (err instanceof ClientApiError) {
        if (err.code === 'VALIDATION_ERROR' && err.details) {
          setFieldErrors(mapFieldErrors(err.details));
          setError(null);
        } else if (err.statusCode === 500 || err.code === 'INTERNAL_SERVER_ERROR') {
          setError('An unexpected error occurred while verifying the OTP.');
          setFieldErrors({});
        } else {
          setError(err.message);
          setFieldErrors({});
        }
      } else {
        setError('An unexpected error occurred while verifying the OTP.');
        setFieldErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError(null);
    try {
      await api.post('/auth/send-otp', {
        universityEmail: email.trim().toLowerCase(),
        password,
        role,
      });
      startResendCountdown();
    } catch (err) {
      if (err instanceof ClientApiError) {
        if (err.code === 'VALIDATION_ERROR' && err.details) {
          setFieldErrors(mapFieldErrors(err.details));
          setError(null);
        } else if (err.statusCode === 500 || err.code === 'INTERNAL_SERVER_ERROR') {
          setError('Failed to resend OTP. Please try again.');
          setFieldErrors({});
        } else {
          setError(err.message);
          setFieldErrors({});
        }
      } else {
        setError('Failed to resend OTP. Please try again.');
        setFieldErrors({});
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-background-100 mx-auto w-full max-w-md rounded-sm border border-gray-200 p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-heading-24 text-gray-1000 font-bold">
          {step === 1 ? 'Create Account' : 'Verify Your Email'}
        </h2>
        <p className="text-label-13 mt-1.5 text-gray-600">
          {step === 1
            ? 'Sign up with your official Chandigarh University email address.'
            : `We sent a 6-digit code to ${email}.`}
        </p>
      </div>

      {error && (
        <div className="text-label-13 mb-6 flex items-center gap-2 rounded-sm border border-red-300 bg-red-100/50 p-4 text-red-800">
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

      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-5">
          {/* Role selection */}
<div>
             <label className="text-label-13 mb-2 block font-semibold text-gray-700">
               I am registering as
             </label>
             <div className="grid grid-cols-2 gap-3">
               <button
                 type="button"
                 onClick={() => {
                   setRole(Role.STUDENT);
                   setFieldErrors(prev => {
                     const next = { ...prev };
                     delete next.role;
                     return next;
                   });
                 }}
                 className={`cursor-pointer rounded-sm border p-3 text-left transition-colors ${
                   role === Role.STUDENT
                     ? 'border-gray-900 bg-gray-100'
                     : 'border-gray-300 bg-background-100 hover:border-gray-400'
                 }`}
               >
                <span className="text-label-14 block font-semibold text-gray-900">Student</span>
                <span className="text-label-12 mt-0.5 block text-gray-500">
                  Seek anonymous peer support
                </span>
              </button>
<button
                 type="button"
                 onClick={() => {
                   setRole(Role.MENTOR);
                   setFieldErrors(prev => {
                     const next = { ...prev };
                     delete next.role;
                     return next;
                   });
                 }}
                 className={`cursor-pointer rounded-sm border p-3 text-left transition-colors ${
                   role === Role.MENTOR
                     ? 'border-gray-900 bg-gray-100'
                     : 'border-gray-300 bg-background-100 hover:border-gray-400'
                 }`}
               >
                <span className="text-label-14 block font-semibold text-gray-900">Peer Mentor</span>
                <span className="text-label-12 mt-0.5 block text-gray-500">
                  Support first-year students
                </span>
              </button>
            </div>
{role === Role.MENTOR && (
               <p className="text-label-12 mt-2 text-amber-700">
                 Your mentor account will be reviewed by an administrator before you can access
                 mentoring features.
               </p>
             )}
             {fieldErrors.role && (
               <p className="text-label-12 mt-2 text-red-600">
                 {fieldErrors.role}
               </p>
             )}
           </div>

<div>
             <label className="text-label-13 mb-2 block font-semibold text-gray-700">
               University Email
             </label>
             <input
               type="email"
               value={email}
               onChange={e => {
                 setEmail(e.target.value);
                 setFieldErrors(prev => {
                   const next = { ...prev };
                   delete next.email;
                   return next;
                 });
               }}
               placeholder="25bcs10067@cuchd.in"
               className={`text-label-14 bg-background-100 text-primary h-10 w-full rounded-sm border px-3 py-2 placeholder-gray-400 focus-visible:outline-none ${
                 fieldErrors.email
                   ? 'border-red-500 focus-visible:border-red-500'
                   : 'border-gray-300 focus-visible:border-blue-700'
               }`}
               required
             />
             {fieldErrors.email && (
               <p className="text-label-12 mt-1.5 text-red-600">{fieldErrors.email}</p>
             )}
             <p className="text-label-12 mt-1.5 text-gray-500">
               Only Chandigarh University emails (@cuchd.in) are accepted.
             </p>
           </div>

<div>
             <label className="text-label-13 mb-2 block font-semibold text-gray-700">Password</label>
             <input
               type="password"
               value={password}
               onChange={e => {
                 setPassword(e.target.value);
                 setFieldErrors(prev => {
                   const next = { ...prev };
                   delete next.password;
                   return next;
                 });
               }}
               placeholder="Minimum 8 characters"
               className={`text-label-14 bg-background-100 text-primary h-10 w-full rounded-sm border px-3 py-2 placeholder-gray-400 focus-visible:outline-none ${
                 fieldErrors.password
                   ? 'border-red-500 focus-visible:border-red-500'
                   : 'border-gray-300 focus-visible:border-blue-700'
               }`}
               required
             />
             {fieldErrors.password && (
               <p className="text-label-12 mt-1.5 text-red-600">{fieldErrors.password}</p>
             )}
           </div>

<div>
             <label className="text-label-13 mb-2 block font-semibold text-gray-700">
               Confirm Password
             </label>
             <input
               type="password"
               value={confirmPassword}
               onChange={e => {
                 setConfirmPassword(e.target.value);
                 setFieldErrors(prev => {
                   const next = { ...prev };
                   delete next.confirmPassword;
                   return next;
                 });
               }}
               placeholder="Re-enter password"
               className={`text-label-14 bg-background-100 text-primary h-10 w-full rounded-sm border px-3 py-2 placeholder-gray-400 focus-visible:outline-none ${
                 fieldErrors.confirmPassword
                   ? 'border-red-500 focus-visible:border-red-500'
                   : 'border-gray-300 focus-visible:border-blue-700'
               }`}
               required
             />
             {fieldErrors.confirmPassword && (
               <p className="text-label-12 mt-1.5 text-red-600">
                 {fieldErrors.confirmPassword}
               </p>
             )}
           </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-button-14 text-background-100 mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm px-4 py-2.5 font-semibold transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="border-background-100/30 border-t-background-100 h-4 w-4 animate-spin rounded-full border-2"></div>
                <span>Sending OTP...</span>
              </>
            ) : (
              <span>Send Verification Code</span>
            )}
          </button>

          <p className="text-label-12 text-center text-gray-500">
            Your account is created only after you verify the code sent to your email.
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <div>
            <label className="text-label-13 mb-2 block font-semibold text-gray-700">
              Verification Code
            </label>
<input
               type="text"
               inputMode="numeric"
               maxLength={6}
               value={otp}
               onChange={e => {
                 setOtp(e.target.value.replace(/\D/g, ''));
                 setFieldErrors({});
               }}
               placeholder="••••••"
              className="text-label-14 bg-background-100 text-primary h-10 w-full rounded-sm border border-gray-300 px-3 py-2 text-center text-xl tracking-[0.5em] placeholder-gray-400 focus-visible:border-blue-700 focus-visible:outline-none"
              required
            />
            <p className="text-label-12 mt-1.5 text-gray-500">Enter the 6-digit code from your email.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-button-14 text-background-100 mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm px-4 py-2.5 font-semibold transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="border-background-100/30 border-t-background-100 h-4 w-4 animate-spin rounded-full border-2"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Create Account</span>
            )}
          </button>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-label-13 cursor-pointer font-medium text-gray-600 hover:text-gray-900"
            >
              ← Edit details
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || resending}
              className="text-label-13 cursor-pointer font-semibold text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:no-underline"
            >
              {resending
                ? 'Resending...'
                : countdown > 0
                  ? `Resend code in ${countdown}s`
                  : 'Resend code'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 border-t border-gray-200 pt-6 text-center">
        <p className="text-label-13 text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-tertiary ml-1 font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

