import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';
import { Globe, MapPin, Calendar, Clock, User, Link, Users } from 'lucide-react';

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
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
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
      window.location.href = '/events';
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel workshop');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded-sm w-1/4" />
        <div className="h-48 bg-gray-200 rounded-sm w-full" />
        <div className="h-32 bg-gray-200 rounded-sm w-full" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <h2 className="text-heading-24 font-bold text-gray-900">Workshop not found</h2>
        <p className="text-copy-14 text-gray-500 mt-2">The workshop may have been cancelled or deleted.</p>
        <a href="/events" className="mt-6 inline-block rounded-sm bg-primary px-5 py-2.5 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors">
          Back to Events
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
        <a href="/events" className="text-label-14 font-semibold text-tertiary hover:underline flex items-center gap-1.5 transition-colors">
          &larr; Back to Events
        </a>
      </div>

      {/* Main card */}
      <div className="rounded-sm border border-gray-200 bg-background-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {workshop.category.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
            {workshop.meetingType === 'ONLINE' ? <Globe className="h-3 w-3 text-gray-600" /> : <MapPin className="h-3 w-3 text-gray-600" />}
            {' '}{workshop.meetingType === 'ONLINE' ? 'Online' : 'Campus'}
          </span>
        </div>

        <h1 className="text-heading-28 sm:text-heading-32 font-bold text-gray-1000 leading-tight">
          {workshop.title}
        </h1>

        <p className="text-copy-15 text-gray-700 mt-4 leading-relaxed whitespace-pre-wrap">
          {workshop.description}
        </p>

        {workshop.resources && (
          <div className="mt-6 p-4 rounded-sm border border-blue-200 bg-blue-50/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">Attached Resources</h4>
            <p className="text-sm text-blue-900 leading-normal">{workshop.resources}</p>
          </div>
        )}

        {/* Logistics Panel */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-sm p-5 grid gap-4 sm:grid-cols-2 text-sm text-gray-500 font-mono">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span>Date:</span>
              <strong className="text-gray-900">{formatDate(workshop.date)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span>Time:</span>
              <strong className="text-gray-900">{formatTime(workshop.time)} ({workshop.durationMinutes} mins)</strong>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span>Mentor:</span>
              <strong className="text-gray-900">{workshop.mentorDisplayName}</strong>
            </div>
            {workshop.meetingType === 'ONLINE' ? (
              <div className="flex items-center gap-2 truncate">
                <Link className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span>Link:</span>
                {workshop.meetingLink ? (
                  <a href={workshop.meetingLink} target="_blank" rel="noreferrer" className="text-tertiary hover:underline truncate">
                    {workshop.meetingLink}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">No link provided</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span>Location:</span>
                <strong className="text-gray-900">{workshop.location || 'Campus'}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Users className="h-5 w-5 text-gray-500" />
            <strong className="text-gray-900 text-lg font-bold">{activeRegistrations.length}</strong> / {workshop.maxAttendees || '\u221E'} registered
          </div>
          <div className="flex gap-3">
            {(isHost || isAdmin) && (
              <button
                type="button"
                onClick={handleCancelWorkshop}
                className="px-5 py-2.5 text-sm font-semibold text-red-800 bg-red-50 border border-red-300 rounded-sm hover:bg-red-100 transition-colors"
              >
                Delete Workshop
              </button>
            )}
            {isRegistered ? (
              <button
                type="button"
                onClick={handleCancelRegistration}
                className="px-6 py-2.5 text-sm font-semibold rounded-sm border bg-green-50 text-green-800 border-green-300 hover:bg-red-50 hover:text-red-850 hover:border-red-300 transition-colors"
              >
                {'\u2713'} Registered
              </button>
            ) : isFull ? (
              <button
                type="button"
                disabled
                className="px-6 py-2.5 text-sm font-semibold rounded-sm bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              >
                Workshop Full
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                className="px-6 py-2.5 text-sm font-semibold rounded-sm bg-primary hover:bg-gray-800 text-background-100 transition-colors"
              >
                Register Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Registrations List (Only visible to host mentor or admin) */}
      {(isHost || isAdmin) && (
        <div className="rounded-sm border border-gray-200 bg-background-100 p-6 shadow-sm">
          <h3 className="text-heading-18 font-bold text-gray-900 mb-4">
            Registered Attendees ({activeRegistrations.length})
          </h3>
          {activeRegistrations.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No registrations yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {activeRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-700 font-semibold">
                  <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
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
