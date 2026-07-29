import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';

interface Registration {
  id: string;
  anonymousIdentityId: string;
  status: string;
  anonymousIdentity?: {
    displayName: string;
  };
}

interface WorkshopDetail {
  id: string;
  title: string;
  description: string;
  mentorId: string;
  mentorDisplayName: string;
  date: string;
  time: string;
  durationMinutes: number;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  category: string;
  maxAttendees: number | null;
  resources: string | null;
  registrations: Registration[];
  userRegistration: Registration | null;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function WorkshopDetailClient({ workshopId }: { workshopId: string }) {
  const user = useStore($user);
  const [workshop, setWorkshop] = useState<WorkshopDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkshopDetail = async () => {
    try {
      if (!user) {
        await fetchCurrentUser();
      }
      const response = await api.get<WorkshopDetail>(`/workshops/${workshopId}`);
      setWorkshop(response);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch workshop details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshopDetail();
  }, [workshopId]);

  const handleRegister = async () => {
    if (!workshop) return;
    try {
      await api.post(`/workshops/${workshop.id}/register`);
      toast.success('Registered successfully!');
      fetchWorkshopDetail();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register');
    }
  };

  const handleCancelRegistration = async () => {
    if (!workshop) return;
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await api.delete(`/workshops/${workshop.id}/register`);
      toast.success('Registration cancelled.');
      fetchWorkshopDetail();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel registration');
    }
  };

  const handleCancelWorkshop = async () => {
    if (!workshop) return;
    if (!confirm('Are you sure you want to delete and cancel this workshop? This cannot be undone.')) return;

    try {
      await api.delete(`/workshops/${workshop.id}`);
      toast.success('Workshop cancelled successfully.');
      window.location.href = '/workshops';
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel workshop');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
        <div className="h-10 bg-slate-800 rounded w-3/4 mb-6" />
        <div className="h-32 bg-slate-800 rounded mb-6" />
        <div className="h-10 bg-slate-800 rounded w-full" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-200 font-sans">Workshop not found</h2>
        <p className="text-sm text-slate-500 mt-2">The workshop may have been cancelled or deleted.</p>
        <a href="/workshops" className="button-primary text-button-14 mt-6 inline-block rounded-xl px-4 py-2">
          Back to Workshops
        </a>
      </div>
    );
  }

  const isHost = user?.role === 'MENTOR' && workshop.mentorId === user?.userId;
  const isAdmin = user?.role === 'ADMIN';
  const activeRegistrations = workshop.registrations.filter(r => r.status === 'REGISTERED');
  const isRegistered = workshop.userRegistration !== null && workshop.userRegistration.status === 'REGISTERED';
  const isFull = workshop.maxAttendees !== null && activeRegistrations.length >= workshop.maxAttendees;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <div>
        <a href="/workshops" className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors">
          ← Back to Workshops
        </a>
      </div>

      {/* Main card */}
      <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {workshop.category.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400">
            {workshop.meetingType === 'ONLINE' ? '🌐 Online' : '📍 Campus'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
          {workshop.title}
        </h1>

        <p className="text-slate-300 mt-4 leading-relaxed whitespace-pre-wrap">
          {workshop.description}
        </p>

        {workshop.resources && (
          <div className="mt-6 p-4 rounded-xl border border-teal-900/30 bg-teal-950/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Attached Resources</h4>
            <p className="text-sm text-slate-350">{workshop.resources}</p>
          </div>
        )}

        {/* Logistics Panel */}
        <div className="mt-8 bg-slate-950/40 border border-slate-900 rounded-xl p-5 grid gap-4 sm:grid-cols-2 text-sm text-slate-400">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>📅 Date:</span>
              <strong className="text-slate-200">{formatDate(workshop.date)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span>⏰ Time:</span>
              <strong className="text-slate-200">{formatTime(workshop.time)} ({workshop.durationMinutes} mins)</strong>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>👤 Mentor:</span>
              <strong className="text-slate-200">{workshop.mentorDisplayName}</strong>
            </div>
            {workshop.meetingType === 'ONLINE' ? (
              <div className="flex items-center gap-2 truncate">
                <span>🔗 Link:</span>
                {workshop.meetingLink ? (
                  <a href={workshop.meetingLink} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline truncate">
                    {workshop.meetingLink}
                  </a>
                ) : (
                  <span className="text-slate-600 italic">No link provided</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>📍 Location:</span>
                <strong className="text-slate-200">{workshop.location || 'Campus'}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-900/60 pt-6">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <span>👥</span>
            <strong className="text-slate-200 text-lg font-bold">{activeRegistrations.length}</strong> / {workshop.maxAttendees || '∞'} registered
          </div>
          <div className="flex gap-3">
            {(isHost || isAdmin) && (
              <button
                type="button"
                onClick={handleCancelWorkshop}
                className="px-5 py-2.5 text-sm font-semibold text-rose-300 bg-rose-950/40 border border-rose-900/40 rounded-xl hover:bg-rose-900/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Delete Workshop
              </button>
            )}
            {isRegistered ? (
              <button
                type="button"
                onClick={handleCancelRegistration}
                className="px-6 py-2.5 text-sm font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-xl hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-900/40 transition-all"
              >
                ✓ Registered
              </button>
            ) : isFull ? (
              <button
                type="button"
                disabled
                className="px-6 py-2.5 text-sm font-bold bg-slate-900 text-slate-600 border border-slate-950 rounded-xl cursor-not-allowed"
              >
                Workshop Full
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                className="px-6 py-2.5 text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Register Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Registrations List (Only visible to host mentor or admin) */}
      {(isHost || isAdmin) && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-lg font-bold text-slate-100 font-sans mb-4">
            Registered Attendees ({activeRegistrations.length})
          </h3>
          {activeRegistrations.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No registrations yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {activeRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-850 rounded-xl text-sm text-slate-300">
                  <span className="text-lg">👤</span>
                  <span className="truncate">{reg.anonymousIdentity?.displayName || 'Anonymous Student'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
