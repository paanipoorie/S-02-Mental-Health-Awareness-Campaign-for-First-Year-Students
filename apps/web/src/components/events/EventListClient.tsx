import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';
import { WorkshopDetailClient } from '../workshops/WorkshopDetailClient';
import { MeetingDetailClient } from '../meetings/MeetingDetailClient';
import {
  Brain,
  Activity,
  BookOpen,
  Clock,
  Sparkles,
  Briefcase,
  MessagesSquare,
  UserCheck,
  Users,
  FileText,
  Video,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Check,
  Search,
  ChevronRight,
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  category: string;
  eventType: 'WORKSHOP' | 'MEETING';
  // Workshop fields
  mentorDisplayName?: string;
  mentorId?: string;
  maxAttendees?: number | null;
  registrationCount?: number;
  registrationStatus?: string;
  // Meeting fields
  hostType?: string;
  hostDisplayName?: string | null;
  attendeeCount?: number;
  isAttending?: boolean;
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

export function EventListClient() {
  const user = useStore($user);
  const [rawEvents, setRawEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL', 'WORKSHOPS', 'MEETINGS'
  const [timeFilter, setTimeFilter] = useState('UPCOMING'); // 'UPCOMING', 'PAST'
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const [page, setPage] = useState(1);

  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeEventType, setActiveEventType] = useState<'WORKSHOP' | 'MEETING' | null>(null);

  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      const type = params.get('type');
      if (id && (type === 'workshop' || type === 'meeting')) {
        setActiveEventId(id);
        setActiveEventType(type.toUpperCase() as any);
      } else {
        setActiveEventId(null);
        setActiveEventType(null);
      }

      if (params.get('deleted') === 'true') {
        toast.success('Event deleted successfully.');
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        await fetchCurrentUser();
      }

      // Fetch both meetings and workshops
      const [workshopsRes, meetingsRes] = await Promise.all([
        api.get<{ data: any[] }>('/workshops?limit=50'),
        api.get<{ data: any[] }>('/meetings?limit=50'),
      ]);

      const combined: EventItem[] = [
        ...workshopsRes.data.map(w => ({ ...w, eventType: 'WORKSHOP' as const })),
        ...meetingsRes.data.map(m => ({ ...m, eventType: 'MEETING' as const })),
      ];

      setRawEvents(combined);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
      toast.error(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  // Client-side filtering and sorting
  useEffect(() => {
    let filtered = [...rawEvents];

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(s) ||
          e.description.toLowerCase().includes(s) ||
          (e.mentorDisplayName && e.mentorDisplayName.toLowerCase().includes(s)) ||
          (e.hostDisplayName && e.hostDisplayName.toLowerCase().includes(s))
      );
    }

    // Type filter
    if (typeFilter === 'WORKSHOPS') {
      filtered = filtered.filter(e => e.eventType === 'WORKSHOP');
    } else if (typeFilter === 'MEETINGS') {
      filtered = filtered.filter(e => e.eventType === 'MEETING');
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(e => e.meetingType === locationFilter);
    }

    // Time filter (Upcoming vs Past)
    const now = new Date();
    // Compare date parts by resetting times for simple checks
    if (timeFilter === 'UPCOMING') {
      filtered = filtered.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getTime() >= now.setHours(0, 0, 0, 0);
      });
      // Sort upcoming ascending (soonest first)
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      filtered = filtered.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getTime() < now.setHours(0, 0, 0, 0);
      });
      // Sort past descending (most recent first)
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    setFilteredEvents(filtered);
    setPage(1);
  }, [rawEvents, search, typeFilter, categoryFilter, locationFilter, timeFilter]);

  const handleRegister = async (workshopId: string) => {
    try {
      await api.post(`/workshops/${workshopId}/register`);
      toast.success('Successfully registered for the workshop!');
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register');
    }
  };

  const handleCancelRegistration = async (workshopId: string) => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await api.delete(`/workshops/${workshopId}/register`);
      toast.success('Registration cancelled.');
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel registration');
    }
  };

  const handleRSVP = async (meetingId: string) => {
    try {
      const response = await api.post<{ rsvped: boolean }>(`/meetings/${meetingId}/rsvp`);
      toast.success(response.rsvped ? 'RSVP registered successfully!' : 'RSVP cancelled.');
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update RSVP');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'MENTAL_HEALTH':
        return <Brain className="h-3.5 w-3.5" />;
      case 'STRESS_MANAGEMENT':
        return <Activity className="h-3.5 w-3.5" />;
      case 'STUDY_SKILLS':
      case 'STUDY_GROUP':
        return <BookOpen className="h-3.5 w-3.5" />;
      case 'TIME_MANAGEMENT':
        return <Clock className="h-3.5 w-3.5" />;
      case 'MINDFULNESS':
        return <Sparkles className="h-3.5 w-3.5" />;
      case 'CAREER_GUIDANCE':
        return <Briefcase className="h-3.5 w-3.5" />;
      case 'PEER_DISCUSSION':
        return <MessagesSquare className="h-3.5 w-3.5" />;
      case 'MENTOR_OFFICE_HOURS':
        return <UserCheck className="h-3.5 w-3.5" />;
      case 'SOCIAL':
        return <Users className="h-3.5 w-3.5" />;
      default:
        return <FileText className="h-3.5 w-3.5" />;
    }
  };

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
  const paginatedEvents = filteredEvents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (activeEventId && activeEventType) {
    return (
      <div className="bg-background-100 mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <a
            href="/events"
            className="text-copy-14 inline-flex items-center gap-1.5 font-semibold text-gray-700 transition-colors hover:text-gray-900"
          >
            ← Back to Events
          </a>
        </div>
        {activeEventType === 'MEETING' ? (
          <MeetingDetailClient meetingId={activeEventId} />
        ) : (
          <WorkshopDetailClient workshopId={activeEventId} />
        )}
      </div>
    );
  }

  const showHostButton = user?.role === 'MENTOR' || user?.role === 'ADMIN';

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-32 text-gray-1000 font-bold">Campus Events</h1>
          <p className="text-copy-14 mt-1 text-gray-500">
            Browse and join mentor-guided workshops and peer-led meetings.
          </p>
        </div>
        {showHostButton && (
          <div className="flex gap-2">
            <a
              href="/events/new?type=workshop"
              className="bg-primary text-button-14 text-background-100 inline-block rounded-sm px-4 py-2 font-semibold transition-colors hover:bg-gray-800 focus-visible:outline-none"
            >
              + Host Workshop
            </a>
            <a
              href="/events/new?type=meeting"
              className="bg-background-100 text-button-14 inline-block rounded-sm border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none"
            >
              + Host Meeting
            </a>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-background-100 grid gap-3 rounded-sm border border-gray-200 p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <input
            type="search"
            placeholder="Search events, hosts or topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-background-100 w-full rounded-sm border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
          />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-background-100 w-full cursor-pointer rounded-sm border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-gray-900"
          >
            <option value="ALL">All Events</option>
            <option value="WORKSHOPS">Workshops Only</option>
            <option value="MEETINGS">Meetings Only</option>
          </select>
        </div>

        {/* Time Filter */}
        <div>
          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            className="bg-background-100 w-full cursor-pointer rounded-sm border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-gray-900"
          >
            <option value="UPCOMING">Upcoming Events</option>
            <option value="PAST">Past Events</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="bg-background-100 w-full cursor-pointer rounded-sm border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-gray-900"
          >
            <option value="">All Locations</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Campus</option>
          </select>
        </div>
      </div>

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
      ) : error ? (
        <div className="bg-background-100 rounded-sm border border-gray-200 py-16 text-center">
          <h3 className="text-heading-18 font-bold text-red-600">Failed to load events</h3>
          <p className="text-copy-14 mx-auto mt-2 max-w-sm text-gray-500">{error}</p>
          <button
            onClick={fetchEvents}
            className="bg-primary text-background-100 mt-6 inline-block rounded-sm px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      ) : paginatedEvents.length === 0 ? (
        <div className="bg-background-100 rounded-sm border border-gray-200 py-16 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-heading-18 mt-4 font-bold text-gray-900">No events found</h3>
          <p className="text-copy-14 mx-auto mt-2 max-w-sm text-gray-500">
            Try adjusting your search filters or check back later for new scheduled sessions!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedEvents.map(event => {
            const isWorkshop = event.eventType === 'WORKSHOP';
            const isRegistered = event.registrationStatus === 'REGISTERED';
            const isAttending = event.isAttending;
            const isFull =
              isWorkshop &&
              event.maxAttendees !== null &&
              event.maxAttendees !== undefined &&
              (event.registrationCount ?? 0) >= event.maxAttendees;

            return (
              <div
                key={event.id}
                className="bg-background-100 flex flex-col justify-between rounded-sm border border-gray-200 p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none"
              >
                <div>
                  {/* Meta details */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {isWorkshop ? 'Workshop' : 'Meeting'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      {getCategoryIcon(event.category)} {event.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-heading-18 line-clamp-1 font-bold text-gray-900">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-copy-14 mt-2 line-clamp-3 leading-normal text-gray-600">
                    {event.description}
                  </p>

                  {/* Logistics */}
                  <div className="text-label-12 mt-4 space-y-2 border-t border-gray-200 pt-4 font-mono text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium text-gray-700">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium text-gray-700">
                        {formatTime(event.time)} ({event.durationMinutes} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-sans font-medium text-gray-700">
                        {isWorkshop ? (
                          <>
                            Mentor:{' '}
                            <strong className="font-semibold">{event.mentorDisplayName}</strong>
                          </>
                        ) : (
                          <>
                            Hosted by{' '}
                            <strong className="font-semibold">
                              {event.hostDisplayName || 'Anonymous'}
                            </strong>
                          </>
                        )}
                      </span>
                    </div>
                    {event.meetingType === 'ONLINE' ? (
                      <div className="flex items-center gap-2 truncate">
                        <Video className="h-3.5 w-3.5 text-gray-400" />
                        {event.meetingLink ? (
                          <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-tertiary truncate hover:underline"
                          >
                            {event.meetingLink}
                          </a>
                        ) : (
                          <span className="italic text-gray-400">No link provided</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate font-sans font-medium text-gray-700">
                          {event.location || 'Campus'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    {isWorkshop ? (
                      <>
                        <strong className="text-gray-700">{event.registrationCount}</strong> /{' '}
                        {event.maxAttendees || '∞'} registered
                      </>
                    ) : (
                      <>
                        <strong className="text-gray-700">{event.attendeeCount}</strong> going
                      </>
                    )}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={
                        isWorkshop
                          ? `/events?id=${event.id}&type=workshop`
                          : `/events?id=${event.id}&type=meeting`
                      }
                      className="bg-background-100 flex items-center gap-1 rounded-sm border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Details <ChevronRight className="h-3 w-3" />
                    </a>
                    {isWorkshop ? (
                      isRegistered ? (
                        <button
                          type="button"
                          onClick={() => handleCancelRegistration(event.id)}
                          className="flex items-center gap-1 rounded-sm border border-gray-300 bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-800"
                        >
                          <Check className="h-3 w-3 text-green-700" /> Registered
                        </button>
                      ) : isFull ? (
                        <button
                          type="button"
                          disabled
                          className="bg-gray-150 cursor-not-allowed rounded-sm border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-400"
                        >
                          Full
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRegister(event.id)}
                          className="bg-primary text-background-100 rounded-sm px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-800"
                        >
                          Register
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRSVP(event.id)}
                        className={`flex items-center gap-1 rounded-sm border px-4 py-1.5 text-xs font-semibold transition-colors ${
                          isAttending
                            ? 'border-gray-300 bg-gray-100 text-gray-800 hover:border-red-300 hover:bg-red-50 hover:text-red-800'
                            : 'bg-primary text-background-100 border-transparent hover:bg-gray-800'
                        }`}
                      >
                        {isAttending ? (
                          <>
                            <Check className="h-3 w-3 text-green-700" /> Going
                          </>
                        ) : (
                          'RSVP'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
