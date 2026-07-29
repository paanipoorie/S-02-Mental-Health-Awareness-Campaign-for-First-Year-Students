import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';

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
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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

      const response = await api.get<{ meetings: Meeting[]; totalPages: number }>(`/meetings?${params.toString()}`);
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
              attendeeCount: response.rsvped ? m.attendeeCount + 1 : Math.max(0, m.attendeeCount - 1),
            };
          }
          return m;
        })
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update RSVP');
    }
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'STUDY_GROUP': return '📚';
      case 'PEER_DISCUSSION': return '💬';
      case 'MENTOR_OFFICE_HOURS': return '👨‍🏫';
      case 'SOCIAL': return '🎉';
      case 'WORKSHOP': return '🛠️';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-200 to-purple-400 font-sans tracking-tight">
            Peer Meetings
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Join peer-led study groups, check-ins, office hours, and social events.
          </p>
        </div>
        <div>
          <a
            href="/meetings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/10 hover:from-teal-400 hover:to-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            ➕ Host a Meeting
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="grid gap-4 md:grid-cols-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="md:col-span-2 relative">
          <input
            type="search"
            placeholder="Search by title or host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          >
            <option value="">All Categories</option>
            <option value="STUDY_GROUP">📚 Study Group</option>
            <option value="PEER_DISCUSSION">💬 Peer Discussion</option>
            <option value="MENTOR_OFFICE_HOURS">👨‍🏫 Office Hours</option>
            <option value="SOCIAL">🎉 Social</option>
            <option value="GENERAL">📋 General</option>
          </select>
        </div>

        <div>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-805 text-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          >
            <option value="">All Locations</option>
            <option value="ONLINE">🌐 Online</option>
            <option value="OFFLINE">📍 Campus</option>
          </select>
        </div>
      </form>

      {/* Grid List */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-950/20 border border-slate-900 rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-full" />
              </div>
              <div className="h-10 bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-16 border border-slate-900 rounded-2xl bg-slate-950/20">
          <svg className="mx-auto h-14 w-14 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-slate-300 font-sans">No meetings found</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters or start a new group study session yourself!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="group flex flex-col justify-between bg-gradient-to-b from-slate-900/60 to-slate-950/60 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/85 transition-all shadow-xl hover:shadow-teal-500/[0.02]"
            >
              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                    {getCategoryEmoji(meeting.category)} {meeting.category.replace('_', ' ')}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-2 py-0.5 text-xs font-semibold text-slate-400">
                    {meeting.meetingType === 'ONLINE' ? '🌐' : '📍'} {meeting.meetingType}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-100 font-sans line-clamp-1 group-hover:text-teal-400 transition-colors">
                  {meeting.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 mt-2 line-clamp-3">
                  {meeting.description}
                </p>

                {/* Logistics */}
                <div className="space-y-2 mt-4 border-t border-slate-900 pt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span className="font-medium text-slate-400">{formatDate(meeting.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏰</span>
                    <span className="font-medium text-slate-400">{formatTime(meeting.time)} ({meeting.durationMinutes} min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span>Hosted by <strong className="text-slate-300 font-semibold">{meeting.hostDisplayName || 'Anonymous'}</strong></span>
                  </div>
                  {meeting.meetingType === 'ONLINE' ? (
                    <div className="flex items-center gap-2 truncate">
                      <span>🔗</span>
                      {meeting.meetingLink ? (
                        <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline truncate">
                          {meeting.meetingLink}
                        </a>
                      ) : (
                        <span className="text-slate-600 italic">No link provided</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 truncate">
                      <span>📍</span>
                      <span className="text-slate-400 truncate">{meeting.location || 'Campus'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-900/60 pt-4">
                <span className="text-xs text-slate-500">
                  👥 <strong className="text-slate-300">{meeting.attendeeCount}</strong> going
                </span>
                <div className="flex gap-2">
                  <a
                    href={`/meetings/${meeting.id}`}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all"
                  >
                    Details
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRSVP(meeting.id)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                      meeting.isAttending
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {meeting.isAttending ? '✓ Going' : 'RSVP'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-900">
          <button
            type="button"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <span className="text-xs text-slate-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-805 rounded-xl hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
