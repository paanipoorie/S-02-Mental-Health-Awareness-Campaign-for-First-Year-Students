import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';
import {
  BookOpen,
  MessageCircle,
  Briefcase,
  PartyPopper,
  Wrench,
  FileText,
  Globe,
  MapPin,
  Calendar,
  Clock,
  User,
  Link,
  Users,
} from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description: string;
  hostType: string;
  hostDisplayName: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  category: string;
  attendeeCount: number;
  isAttending: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], {
    weekday: 'short',
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

export function MeetingListClient() {
  const user = useStore($user);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      if (!user) {
        await fetchCurrentUser();
      }
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '12');
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (type) params.append('meetingType', type);

      const response = await api.get<{ meetings: Meeting[]; totalPages: number }>(
        `/meetings?${params.toString()}`
      );
      setMeetings(response.meetings);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [page, category, type]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMeetings();
  };

  const handleRSVP = async (meetingId: string) => {
    try {
      const response = await api.post<{ rsvped: boolean }>(`/meetings/${meetingId}/rsvp`);
      toast.success(response.rsvped ? 'RSVP registered successfully!' : 'RSVP cancelled.');
      setMeetings(prev =>
        prev.map(m => {
          if (m.id === meetingId) {
            return {
              ...m,
              isAttending: response.rsvped,
              attendeeCount: response.rsvped
                ? m.attendeeCount + 1
                : Math.max(0, m.attendeeCount - 1),
            };
          }
          return m;
        })
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update RSVP');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'STUDY_GROUP':
        return <BookOpen className="h-3 w-3 text-gray-600" />;
      case 'PEER_DISCUSSION':
        return <MessageCircle className="h-3 w-3 text-gray-600" />;
      case 'MENTOR_OFFICE_HOURS':
        return <Briefcase className="h-3 w-3 text-gray-600" />;
      case 'SOCIAL':
        return <PartyPopper className="h-3 w-3 text-gray-600" />;
      case 'WORKSHOP':
        return <Wrench className="h-3 w-3 text-gray-600" />;
      default:
        return <FileText className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-32 text-gray-1000 font-bold">Peer Meetings</h1>
          <p className="text-copy-14 mt-1 text-gray-500">
            Join peer-led study groups, check-ins, office hours, and social events.
          </p>
        </div>
        <div>
          <a
            href="/meetings/new"
            className="bg-primary text-button-14 text-background-100 inline-block rounded-sm px-5 py-2.5 font-semibold transition-colors hover:bg-gray-800 focus-visible:outline-none"
          >
            + Host a Meeting
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-background-100 grid gap-3 rounded-sm border border-gray-200 p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="relative sm:col-span-2">
          <input
            type="search"
            placeholder="Search by title or host..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-background-100 w-full rounded-sm border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
          />
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div>
          <select
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-background-100 w-full cursor-pointer rounded-sm border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-gray-900"
          >
            <option value="">All Categories</option>
            <option value="STUDY_GROUP">
              <BookOpen className="mr-1 inline h-3.5 w-3.5" /> Study Group
            </option>
            <option value="PEER_DISCUSSION">
              <MessageCircle className="mr-1 inline h-3.5 w-3.5" /> Peer Discussion
            </option>
            <option value="MENTOR_OFFICE_HOURS">
              <Briefcase className="mr-1 inline h-3.5 w-3.5" /> Office Hours
            </option>
            <option value="SOCIAL">
              <PartyPopper className="mr-1 inline h-3.5 w-3.5" /> Social
            </option>
            <option value="GENERAL">
              <FileText className="mr-1 inline h-3.5 w-3.5" /> General
            </option>
          </select>
        </div>

        <div>
          <select
            value={type}
            onChange={e => {
              setType(e.target.value);
              setPage(1);
            }}
            className="bg-background-100 w-full cursor-pointer rounded-sm border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-gray-900"
          >
            <option value="">All Locations</option>
            <option value="ONLINE">
              <Globe className="mr-1 inline h-3.5 w-3.5" /> Online
            </option>
            <option value="OFFLINE">
              <MapPin className="mr-1 inline h-3.5 w-3.5" /> Campus
            </option>
          </select>
        </div>
      </form>

      {/* Grid List */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-background-100 flex h-64 animate-pulse flex-col justify-between rounded-sm border border-gray-200 p-6"
            >
              <div className="space-y-3">
                <div className="h-4 w-1/3 rounded-sm bg-gray-200" />
                <div className="h-6 w-3/4 rounded-sm bg-gray-200" />
                <div className="h-4 w-full rounded-sm bg-gray-200" />
              </div>
              <div className="h-10 w-full rounded-sm bg-gray-200" />
            </div>
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-background-100 rounded-sm border border-gray-200 py-16 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-heading-18 mt-4 font-bold text-gray-900">No meetings found</h3>
          <p className="text-copy-14 mx-auto mt-2 max-w-sm text-gray-500">
            Try adjusting your search filters or start a new group study session yourself!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map(meeting => (
            <div
              key={meeting.id}
              className="bg-background-100 flex flex-col justify-between rounded-sm border border-gray-200 p-6 transition-colors hover:bg-gray-50 focus-visible:outline-none"
            >
              <div>
                {/* Meta details */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                    {getCategoryIcon(meeting.category)} {meeting.category.replace('_', ' ')}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {meeting.meetingType === 'ONLINE' ? (
                      <Globe className="h-3 w-3 text-gray-600" />
                    ) : (
                      <MapPin className="h-3 w-3 text-gray-600" />
                    )}{' '}
                    {meeting.meetingType}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-heading-18 font-bold text-gray-900">{meeting.title}</h3>

                {/* Description */}
                <p className="text-copy-14 mt-2 line-clamp-3 leading-normal text-gray-600">
                  {meeting.description}
                </p>

                {/* Logistics */}
                <div className="text-label-12 mt-4 space-y-2 border-t border-gray-200 pt-4 font-mono text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                    <span className="font-medium text-gray-700">{formatDate(meeting.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                    <span className="font-medium text-gray-700">
                      {formatTime(meeting.time)} ({meeting.durationMinutes} min)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                    <span className="font-sans font-medium text-gray-700">
                      Hosted by{' '}
                      <strong className="font-semibold">
                        {meeting.hostDisplayName || 'Anonymous'}
                      </strong>
                    </span>
                  </div>
                  {meeting.meetingType === 'ONLINE' ? (
                    <div className="flex items-center gap-2 truncate">
                      <Link className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
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
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                      <span className="truncate font-sans font-medium text-gray-700">
                        {meeting.location || 'Campus'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                <span className="text-xs text-gray-500">
                  <Users className="mr-1 inline h-3 w-3" />
                  <strong className="text-gray-700">{meeting.attendeeCount}</strong> going
                </span>
                <div className="flex gap-2">
                  <a
                    href={`/meetings/${meeting.id}`}
                    className="bg-background-100 rounded-sm border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Details
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRSVP(meeting.id)}
                    className={`rounded-sm border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      meeting.isAttending
                        ? 'border-green-300 bg-green-50 text-green-800'
                        : 'bg-primary text-background-100 border-transparent hover:bg-gray-800'
                    }`}
                  >
                    {meeting.isAttending ? '\u2713 Going' : 'RSVP'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="text-button-14 bg-background-100 rounded-sm border border-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-label-14 font-mono font-medium text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="text-button-14 bg-background-100 rounded-sm border border-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
