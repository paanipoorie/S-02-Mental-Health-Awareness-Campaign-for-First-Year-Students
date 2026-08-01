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
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
    if (
      !confirm('Are you sure you want to delete and cancel this workshop? This cannot be undone.')
    )
      return;

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
      <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-12">
        <div className="h-4 w-1/4 rounded-sm bg-gray-200" />
        <div className="h-48 w-full rounded-sm bg-gray-200" />
        <div className="h-32 w-full rounded-sm bg-gray-200" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-heading-24 font-bold text-gray-900">Workshop not found</h2>
        <p className="text-copy-14 mt-2 text-gray-500">
          The workshop may have been cancelled or deleted.
        </p>
        <a
          href="/events"
          className="bg-primary text-button-14 text-background-100 mt-6 inline-block rounded-sm px-5 py-2.5 font-semibold transition-colors hover:bg-gray-800"
        >
          Back to Events
        </a>
      </div>
    );
  }

  const isHost = user?.role === 'MENTOR' && workshop.mentorId === user?.userId;
  const isAdmin = user?.role === 'ADMIN';
  const activeRegistrations = workshop.registrations.filter(r => r.status === 'REGISTERED');
  const isRegistered =
    workshop.userRegistration !== null && workshop.userRegistration.status === 'REGISTERED';
  const isFull =
    workshop.maxAttendees !== null && activeRegistrations.length >= workshop.maxAttendees;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div>
        <a
          href="/events"
          className="text-label-14 text-tertiary flex items-center gap-1.5 font-semibold transition-colors hover:underline"
        >
          &larr; Back to Events
        </a>
      </div>

      {/* Main card */}
      <div className="bg-background-100 rounded-sm border border-gray-200 p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
            {workshop.category.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
            {workshop.meetingType === 'ONLINE' ? (
              <Globe className="h-3 w-3 text-gray-600" />
            ) : (
              <MapPin className="h-3 w-3 text-gray-600" />
            )}{' '}
            {workshop.meetingType === 'ONLINE' ? 'Online' : 'Campus'}
          </span>
        </div>

        <h1 className="text-heading-28 sm:text-heading-32 text-gray-1000 font-bold leading-tight">
          {workshop.title}
        </h1>

        <p className="text-copy-15 mt-4 whitespace-pre-wrap leading-relaxed text-gray-700">
          {workshop.description}
        </p>

        {workshop.resources && (
          <div className="mt-6 rounded-sm border border-blue-200 bg-blue-50/30 p-4">
            <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-800">
              Attached Resources
            </h4>
            <p className="text-sm leading-normal text-blue-900">{workshop.resources}</p>
          </div>
        )}

        {/* Logistics Panel */}
        <div className="mt-8 grid gap-4 rounded-sm border border-gray-200 bg-gray-50 p-5 font-mono text-sm text-gray-500 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span>Date:</span>
              <strong className="text-gray-900">{formatDate(workshop.date)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span>Time:</span>
              <strong className="text-gray-900">
                {formatTime(workshop.time)} ({workshop.durationMinutes} mins)
              </strong>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span>Mentor:</span>
              <strong className="text-gray-900">{workshop.mentorDisplayName}</strong>
            </div>
            {workshop.meetingType === 'ONLINE' ? (
              <div className="flex items-center gap-2 truncate">
                <Link className="h-4 w-4 flex-shrink-0 text-gray-500" />
                <span>Link:</span>
                {workshop.meetingLink ? (
                  <a
                    href={workshop.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tertiary truncate hover:underline"
                  >
                    {workshop.meetingLink}
                  </a>
                ) : (
                  <span className="italic text-gray-400">No link provided</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                <span>Location:</span>
                <strong className="text-gray-900">{workshop.location || 'Campus'}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="h-5 w-5 text-gray-500" />
            <strong className="text-lg font-bold text-gray-900">
              {activeRegistrations.length}
            </strong>{' '}
            / {workshop.maxAttendees || '\u221E'} registered
          </div>
          <div className="flex gap-3">
            {(isHost || isAdmin) && (
              <button
                type="button"
                onClick={handleCancelWorkshop}
                className="rounded-sm border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100"
              >
                Delete Workshop
              </button>
            )}
            {isRegistered ? (
              <button
                type="button"
                onClick={handleCancelRegistration}
                className="hover:text-red-850 rounded-sm border border-green-300 bg-green-50 px-6 py-2.5 text-sm font-semibold text-green-800 transition-colors hover:border-red-300 hover:bg-red-50"
              >
                {'\u2713'} Registered
              </button>
            ) : isFull ? (
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-sm border border-gray-200 bg-gray-100 px-6 py-2.5 text-sm font-semibold text-gray-400"
              >
                Workshop Full
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                className="bg-primary text-background-100 rounded-sm px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-800"
              >
                Register Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Registrations List (Only visible to host mentor or admin) */}
      {(isHost || isAdmin) && (
        <div className="bg-background-100 rounded-sm border border-gray-200 p-6 shadow-sm">
          <h3 className="text-heading-18 mb-4 font-bold text-gray-900">
            Registered Attendees ({activeRegistrations.length})
          </h3>
          {activeRegistrations.length === 0 ? (
            <p className="text-sm italic text-gray-400">No registrations yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {activeRegistrations.map(reg => (
                <div
                  key={reg.id}
                  className="flex items-center gap-2 rounded-sm border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-gray-700"
                >
                  <User className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span className="truncate">
                    {reg.anonymousIdentity?.displayName || 'Anonymous Student'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
