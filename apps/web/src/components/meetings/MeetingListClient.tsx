import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';
import { BookOpen, MessageCircle, Briefcase, PartyPopper, Wrench, FileText, Globe, MapPin, Calendar, Clock, User, Link, Users } from 'lucide-react';

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

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'STUDY_GROUP': return <BookOpen className="h-3 w-3 text-gray-600" />;
      case 'PEER_DISCUSSION': return <MessageCircle className="h-3 w-3 text-gray-600" />;
      case 'MENTOR_OFFICE_HOURS': return <Briefcase className="h-3 w-3 text-gray-600" />;
      case 'SOCIAL': return <PartyPopper className="h-3 w-3 text-gray-600" />;
      case 'WORKSHOP': return <Wrench className="h-3 w-3 text-gray-600" />;
      default: return <FileText className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-heading-32 font-bold text-gray-1000">Peer Meetings</h1>
            <p className="text-copy-14 text-gray-500 mt-1">
              Join peer-led study groups, check-ins, office hours, and social events.
            </p>
          </div>
          <div>
            <a
                href="/meetings/new"
                className="inline-block rounded-sm bg-primary px-5 py-2.5 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors focus-visible:outline-none"
            >
              + Host a Meeting
            </a>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-background-100 p-5 rounded-sm border border-gray-200 shadow-sm">
          <div className="sm:col-span-2 relative">
            <input
                type="search"
                placeholder="Search by title or host..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background-100 border border-gray-200 text-gray-900 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors placeholder-gray-400"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div>
            <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-background-100 border border-gray-200 text-gray-700 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="STUDY_GROUP"><BookOpen className="h-3.5 w-3.5 inline mr-1" /> Study Group</option>
              <option value="PEER_DISCUSSION"><MessageCircle className="h-3.5 w-3.5 inline mr-1" /> Peer Discussion</option>
              <option value="MENTOR_OFFICE_HOURS"><Briefcase className="h-3.5 w-3.5 inline mr-1" /> Office Hours</option>
              <option value="SOCIAL"><PartyPopper className="h-3.5 w-3.5 inline mr-1" /> Social</option>
              <option value="GENERAL"><FileText className="h-3.5 w-3.5 inline mr-1" /> General</option>
            </select>
          </div>

          <div>
            <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-background-100 border border-gray-200 text-gray-700 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors cursor-pointer"
            >
              <option value="">All Locations</option>
              <option value="ONLINE"><Globe className="h-3.5 w-3.5 inline mr-1" /> Online</option>
              <option value="OFFLINE"><MapPin className="h-3.5 w-3.5 inline mr-1" /> Campus</option>
            </select>
          </div>
        </form>

        {/* Grid List */}
        {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-background-100 border border-gray-200 rounded-sm p-6 h-64 animate-pulse flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded-sm w-1/3" />
                      <div className="h-6 bg-gray-200 rounded-sm w-3/4" />
                      <div className="h-4 bg-gray-200 rounded-sm w-full" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded-sm w-full" />
                  </div>
              ))}
            </div>
        ) : meetings.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 rounded-sm bg-background-100">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-heading-18 font-bold text-gray-900">No meetings found</h3>
              <p className="mt-2 text-copy-14 text-gray-500 max-w-sm mx-auto">
                Try adjusting your search filters or start a new group study session yourself!
              </p>
            </div>
        ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {meetings.map((meeting) => (
                  <div
                      key={meeting.id}
                      className="flex flex-col justify-between bg-background-100 border border-gray-200 rounded-sm p-6 hover:bg-gray-50 transition-colors focus-visible:outline-none"
                  >
                    <div>
                      {/* Meta details */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                        {getCategoryIcon(meeting.category)} {meeting.category.replace('_', ' ')}
                      </span>
                        <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        {meeting.meetingType === 'ONLINE' ? <Globe className="h-3 w-3 text-gray-600" /> : <MapPin className="h-3 w-3 text-gray-600" />}
                        {' '}{meeting.meetingType}
                      </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-heading-18 font-bold text-gray-900">
                        {meeting.title}
                      </h3>

                      {/* Description */}
                      <p className="text-copy-14 text-gray-600 mt-2 line-clamp-3 leading-normal">
                        {meeting.description}
                      </p>

                      {/* Logistics */}
                      <div className="space-y-2 mt-4 border-t border-gray-200 pt-4 text-label-12 text-gray-500 font-mono">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-700">{formatDate(meeting.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-700">{formatTime(meeting.time)} ({meeting.durationMinutes} min)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                          <span className="font-sans font-medium text-gray-700">Hosted by <strong className="font-semibold">{meeting.hostDisplayName || 'Anonymous'}</strong></span>
                        </div>
                        {meeting.meetingType === 'ONLINE' ? (
                            <div className="flex items-center gap-2 truncate">
                              <Link className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                              {meeting.meetingLink ? (
                                  <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="text-tertiary hover:underline truncate">
                                    {meeting.meetingLink}
                                  </a>
                              ) : (
                                  <span className="text-gray-400 italic">No link provided</span>
                              )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 truncate">
                              <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                              <span className="font-sans font-medium text-gray-700 truncate">{meeting.location || 'Campus'}</span>
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                    <span className="text-xs text-gray-500">
                      <Users className="h-3 w-3 inline mr-1" /><strong className="text-gray-700">{meeting.attendeeCount}</strong> going
                    </span>
                      <div className="flex gap-2">
                        <a
                            href={`/meetings/${meeting.id}`}
                            className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-background-100 hover:bg-gray-50 border border-gray-200 rounded-sm transition-colors"
                        >
                          Details
                        </a>
                        <button
                            type="button"
                            onClick={() => handleRSVP(meeting.id)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                                meeting.isAttending
                                    ? 'bg-green-50 text-green-800 border-green-300'
                                    : 'bg-primary hover:bg-gray-800 text-background-100 border-transparent'
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
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                  type="button"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-button-14 font-semibold text-gray-700 bg-background-100 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-label-14 text-gray-500 font-mono font-medium">
              Page {page} of {totalPages}
            </span>
              <button
                  type="button"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-button-14 font-semibold text-gray-700 bg-background-100 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
        )}
      </div>
  );
}
