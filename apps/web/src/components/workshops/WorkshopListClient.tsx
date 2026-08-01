import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';
import {
  Brain,
  Smile,
  BookOpen,
  Clock,
  Sparkles,
  Briefcase,
  FileText,
  Globe,
  MapPin,
  Calendar,
  User,
  Link,
  Users,
} from 'lucide-react';

interface Workshop {
  id: string;
  title: string;
  description: string;
  mentorDisplayName: string;
  mentorId: string;
  date: string;
  time: string;
  durationMinutes: number;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  category: string;
  maxAttendees: number | null;
  registrationCount: number;
  registrationStatus: string; // 'REGISTERED', 'CANCELLED', 'NONE'
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

export function WorkshopListClient() {
  const user = useStore($user);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWorkshops = async () => {
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

      const response = await api.get<{ workshops: Workshop[]; totalPages: number }>(
        `/workshops?${params.toString()}`
      );
      setWorkshops(response.workshops);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch workshops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [page, category, type]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWorkshops();
  };

  const handleRegister = async (workshopId: string) => {
    try {
      await api.post(`/workshops/${workshopId}/register`);
      toast.success('Successfully registered for the workshop!');
      fetchWorkshops(); // Reload to sync state
    } catch (err: any) {
      toast.error(err.message || 'Failed to register');
    }
  };

  const handleCancelRegistration = async (workshopId: string) => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await api.delete(`/workshops/${workshopId}/register`);
      toast.success('Registration cancelled.');
      fetchWorkshops(); // Reload to sync state
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel registration');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'MENTAL_HEALTH':
        return <Brain className="h-3 w-3 text-gray-600" />;
      case 'STRESS_MANAGEMENT':
        return <Smile className="h-3 w-3 text-gray-600" />;
      case 'STUDY_SKILLS':
        return <BookOpen className="h-3 w-3 text-gray-600" />;
      case 'TIME_MANAGEMENT':
        return <Clock className="h-3 w-3 text-gray-600" />;
      case 'MINDFULNESS':
        return <Sparkles className="h-3 w-3 text-gray-600" />;
      case 'CAREER_GUIDANCE':
        return <Briefcase className="h-3 w-3 text-gray-600" />;
      case 'GENERAL':
        return <FileText className="h-3 w-3 text-gray-600" />;
      default:
        return <FileText className="h-3 w-3 text-gray-600" />;
    }
  };

  const showHostButton = user?.role === 'MENTOR' || user?.role === 'ADMIN';

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-32 text-gray-1000 font-bold">Mentor Workshops</h1>
          <p className="text-copy-14 mt-1 text-gray-500">
            Attend professional, mentor-guided workshops on stress, sleep, welfare, and academics.
          </p>
        </div>
        {showHostButton && (
          <div>
            <a
              href="/workshops/new"
              className="bg-primary text-button-14 text-background-100 inline-block rounded-sm px-5 py-2.5 font-semibold transition-colors hover:bg-gray-800 focus-visible:outline-none"
            >
              + Host a Workshop
            </a>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-background-100 grid gap-3 rounded-sm border border-gray-200 p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="relative sm:col-span-2">
          <input
            type="search"
            placeholder="Search workshops..."
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
            <option value="MENTAL_HEALTH">
              <Brain className="mr-1 inline h-3.5 w-3.5" /> Mental Health
            </option>
            <option value="STRESS_MANAGEMENT">
              <Smile className="mr-1 inline h-3.5 w-3.5" /> Stress Management
            </option>
            <option value="STUDY_SKILLS">
              <BookOpen className="mr-1 inline h-3.5 w-3.5" /> Study Skills
            </option>
            <option value="TIME_MANAGEMENT">
              <Clock className="mr-1 inline h-3.5 w-3.5" /> Time Management
            </option>
            <option value="MINDFULNESS">
              <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Mindfulness
            </option>
            <option value="CAREER_GUIDANCE">
              <Briefcase className="mr-1 inline h-3.5 w-3.5" /> Career Guidance
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
      ) : workshops.length === 0 ? (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="text-heading-18 mt-4 font-bold text-gray-900">No workshops found</h3>
          <p className="text-copy-14 mx-auto mt-2 max-w-sm text-gray-500">
            There are no workshops scheduled right now. Check back soon for updates from our
            mentors!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map(workshop => {
            const isRegistered = workshop.registrationStatus === 'REGISTERED';
            const isFull =
              workshop.maxAttendees !== null && workshop.registrationCount >= workshop.maxAttendees;

            return (
              <div
                key={workshop.id}
                className="bg-background-100 flex flex-col justify-between rounded-sm border border-gray-200 p-6 transition-colors hover:bg-gray-50 focus-visible:outline-none"
              >
                <div>
                  {/* Meta details */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      {getCategoryIcon(workshop.category)} {workshop.category.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {workshop.meetingType === 'ONLINE' ? (
                        <Globe className="h-3 w-3 text-gray-600" />
                      ) : (
                        <MapPin className="h-3 w-3 text-gray-600" />
                      )}{' '}
                      {workshop.meetingType}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-heading-18 font-bold text-gray-900">{workshop.title}</h3>

                  {/* Description */}
                  <p className="text-copy-14 mt-2 line-clamp-3 leading-normal text-gray-600">
                    {workshop.description}
                  </p>

                  {/* Logistics */}
                  <div className="text-label-12 mt-4 space-y-2 border-t border-gray-200 pt-4 font-mono text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                      <span className="font-medium text-gray-700">{formatDate(workshop.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {formatTime(workshop.time)} ({workshop.durationMinutes} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                      <span className="font-sans font-medium text-gray-700">
                        Mentor:{' '}
                        <strong className="font-semibold">{workshop.mentorDisplayName}</strong>
                      </span>
                    </div>
                    {workshop.meetingType === 'ONLINE' ? (
                      <div className="flex items-center gap-2 truncate">
                        <Link className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
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
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                        <span className="truncate font-sans font-medium text-gray-700">
                          {workshop.location || 'Campus'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                  <span className="text-xs text-gray-500">
                    <Users className="mr-1 inline h-3 w-3" />
                    <strong className="text-gray-700">{workshop.registrationCount}</strong> /{' '}
                    {workshop.maxAttendees || '\u221E'} registered
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={`/workshops/${workshop.id}`}
                      className="bg-background-100 rounded-sm border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Details
                    </a>
                    {isRegistered ? (
                      <button
                        type="button"
                        onClick={() => handleCancelRegistration(workshop.id)}
                        className="rounded-sm border border-green-300 bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-800 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-800"
                      >
                        {'\u2713'} Registered
                      </button>
                    ) : isFull ? (
                      <button
                        type="button"
                        disabled
                        className="text-gray-450 cursor-not-allowed rounded-sm border border-gray-200 bg-gray-100 px-4 py-1.5 text-xs font-semibold"
                      >
                        Full
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRegister(workshop.id)}
                        className="bg-primary text-background-100 rounded-sm px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-800"
                      >
                        Register
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
