import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';
import { Globe, MapPin, Calendar, Clock, User, Link, Users } from 'lucide-react';

interface Attendee {
  id: string;
  anonymousIdentityId: string;
  anonymousIdentity?: {
    displayName: string;
  };
}

interface MeetingDetail {
  id: string;
  title: string;
  description: string;
  hostType: string;
  hostDisplayName: string | null;
  hostUserId: string | null;
  hostIdentityId: string | null;
  hostEmail?: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  category: string;
  attendees: Attendee[];
  isAttending: boolean;
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

export function MeetingDetailClient({ meetingId }: { meetingId: string }) {
  const user = useStore($user);
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeetingDetail = async () => {
    try {
      if (!user) {
        await fetchCurrentUser();
      }
      const response = await api.get<MeetingDetail>(`/meetings/${meetingId}`);
      setMeeting(response);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch meeting details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingDetail();
  }, [meetingId]);

  const handleRSVP = async () => {
    if (!meeting) return;
    try {
      const response = await api.post<{ rsvped: boolean }>(`/meetings/${meeting.id}/rsvp`);
      toast.success(response.rsvped ? 'RSVP registered!' : 'RSVP cancelled.');
      fetchMeetingDetail(); // Refresh attendee list and attending status
    } catch (err: any) {
      toast.error(err.message || 'Failed to update RSVP');
    }
  };

  const handleCancelMeeting = async () => {
    if (!meeting) return;
    if (!confirm('Are you sure you want to cancel and delete this meeting? This cannot be undone.'))
      return;

    try {
      await api.delete(`/meetings/${meeting.id}`);
      window.location.href = '/events?deleted=true';
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel meeting');
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

  if (!meeting) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-heading-24 font-bold text-gray-900">Meeting not found</h2>
        <p className="text-copy-14 mt-2 text-gray-500">
          The meeting may have been cancelled or deleted.
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

  const isHost = user?.role === 'MENTOR' && meeting.hostUserId === user?.userId;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div>
        <a
          href="/events"
          className="text-label-14 text-tertiary flex items-center gap-1.5 font-semibold transition-colors hover:underline"
        >
          ← Back to Events
        </a>
      </div>

      {/* Main card */}
      <div className="bg-background-100 rounded-sm border border-gray-200 p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
              {meeting.category.replace('_', ' ')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
              {meeting.meetingType === 'ONLINE' ? (
                <Globe className="h-3 w-3 text-gray-600" />
              ) : (
                <MapPin className="h-3 w-3 text-gray-600" />
              )}{' '}
              {meeting.meetingType === 'ONLINE' ? 'Online' : 'Offline'}
            </span>
          </div>
          {(isHost || user?.role === 'ADMIN') && (
            <button
              onClick={handleCancelMeeting}
              className="text-label-12 rounded-sm border border-red-200 px-3 py-1.5 font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>

        <h1 className="text-heading-28 sm:text-heading-32 text-gray-1000 font-bold leading-tight">
          {meeting.title}
        </h1>

        <p className="text-copy-15 mt-4 whitespace-pre-wrap leading-relaxed text-gray-700">
          {meeting.description}
        </p>

        {/* Meeting Logistics Panel */}
        <div className="mt-8 grid gap-4 rounded-sm border border-gray-200 bg-gray-50 p-5 font-mono text-sm text-gray-500 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span>Date:</span>
              <strong className="text-gray-900">{formatDate(meeting.date)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span>Time:</span>
              <strong className="text-gray-900">
                {formatTime(meeting.time)} ({meeting.durationMinutes} mins)
              </strong>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span>Host:</span>
              <strong className="text-gray-900">{meeting.hostDisplayName || 'Anonymous'}</strong>
            </div>
            {meeting.meetingType === 'ONLINE' ? (
              <div className="flex items-center gap-2 truncate">
                <Link className="h-4 w-4 flex-shrink-0 text-gray-500" />
                <span>Link:</span>
                {meeting.meetingLink ? (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tertiary truncate hover:underline"
                  >
                    {meeting.meetingLink}
                  </a>
                ) : (
                  <span className="italic text-gray-400">No link provided</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                <span>Location:</span>
                <strong className="text-gray-900">{meeting.location || 'Campus'}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Creator Section */}
        <div className="mt-6 flex items-center gap-3 border-t border-gray-150 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-blue-100 bg-blue-50 text-base font-bold text-blue-800">
            {(meeting.hostDisplayName || 'Anonymous').charAt(0)}
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Hosted by</div>
            <div className="text-sm font-bold text-gray-900">{meeting.hostDisplayName || 'Anonymous'}</div>
            {meeting.hostType === 'MENTOR' && (
              <div className="mt-1 flex flex-col gap-1">
                {meeting.hostEmail && (
                  <div className="text-xs text-gray-600">
                    Email: <span className="font-semibold text-gray-800">{meeting.hostEmail}</span>
                  </div>
                )}
                <div>
                  <span className="rounded-sm border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                    Verified Peer Mentor
                  </span>
                </div>
              </div>
            )}
            {meeting.hostType !== 'MENTOR' && (
              <span className="mt-1 inline-block rounded-sm border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                Peer Student
              </span>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="h-5 w-5 text-gray-500" />
            <strong className="text-lg font-bold text-gray-900">
              {meeting.attendees.length}
            </strong>{' '}
            attending
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRSVP}
              className={`rounded-sm border px-6 py-2.5 text-sm font-semibold transition-colors ${
                meeting.isAttending
                  ? 'border-green-300 bg-green-50 text-green-800'
                  : 'bg-primary text-background-100 border-transparent hover:bg-gray-800'
              }`}
            >
              {meeting.isAttending ? '\u2713 Going' : 'RSVP to Join'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendees list section */}
      <div className="bg-background-100 rounded-sm border border-gray-200 p-6 shadow-sm">
        <h3 className="text-heading-18 mb-4 font-bold text-gray-900">Attendees List</h3>
        {meeting.attendees.length === 0 ? (
          <p className="text-sm italic text-gray-400">
            No one has RSVP'd yet. Be the first to join!
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {meeting.attendees.map(attendee => (
              <div
                key={attendee.id}
                className="flex items-center gap-2 rounded-sm border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-gray-700"
              >
                <User className="h-4 w-4 flex-shrink-0 text-gray-500" />
                <span className="truncate">
                  {attendee.anonymousIdentity?.displayName || 'Anonymous Student'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
