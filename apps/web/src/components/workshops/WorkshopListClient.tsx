import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';

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
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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

      const response = await api.get<{ workshops: Workshop[]; totalPages: number }>(`/workshops?${params.toString()}`);
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

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'MENTAL_HEALTH': return '🧠';
      case 'STRESS_MANAGEMENT': return '😌';
      case 'STUDY_SKILLS': return '📚';
      case 'TIME_MANAGEMENT': return '⏰';
      case 'MINDFULNESS': return '🧘';
      case 'CAREER_GUIDANCE': return '💼';
      case 'GENERAL': return '📋';
      default: return '📋';
    }
  };

  const showHostButton = user?.role === 'MENTOR' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-32 font-bold text-gray-1000">Mentor Workshops</h1>
          <p className="text-copy-14 text-gray-500 mt-1">
            Attend professional, mentor-guided workshops on stress, sleep, welfare, and academics.
          </p>
        </div>
        {showHostButton && (
          <div>
            <a
              href="/workshops/new"
              className="inline-block rounded-sm bg-primary px-5 py-2.5 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors focus-visible:outline-none"
            >
              + Host a Workshop
            </a>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-background-100 p-5 rounded-sm border border-gray-200 shadow-sm">
        <div className="sm:col-span-2 relative">
          <input
            type="search"
            placeholder="Search workshops..."
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
            <option value="MENTAL_HEALTH">🧠 Mental Health</option>
            <option value="STRESS_MANAGEMENT">😌 Stress Management</option>
            <option value="STUDY_SKILLS">📚 Study Skills</option>
            <option value="TIME_MANAGEMENT">⏰ Time Management</option>
            <option value="MINDFULNESS">🧘 Mindfulness</option>
            <option value="CAREER_GUIDANCE">💼 Career Guidance</option>
            <option value="GENERAL">📋 General</option>
          </select>
        </div>

        <div>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-background-100 border border-gray-200 text-gray-700 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors cursor-pointer"
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
      ) : workshops.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-sm bg-background-100">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-heading-18 font-bold text-gray-900">No workshops found</h3>
          <p className="mt-2 text-copy-14 text-gray-500 max-w-sm mx-auto">
            There are no workshops scheduled right now. Check back soon for updates from our mentors!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop) => {
            const isRegistered = workshop.registrationStatus === 'REGISTERED';
            const isFull = workshop.maxAttendees !== null && workshop.registrationCount >= workshop.maxAttendees;

            return (
              <div
                key={workshop.id}
                className="flex flex-col justify-between bg-background-100 border border-gray-200 rounded-sm p-6 hover:bg-gray-50 transition-colors focus-visible:outline-none"
              >
                <div>
                  {/* Meta details */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      {getCategoryEmoji(workshop.category)} {workshop.category.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {workshop.meetingType === 'ONLINE' ? '🌐' : '📍'} {workshop.meetingType}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-heading-18 font-bold text-gray-900">
                    {workshop.title}
                  </h3>

                  {/* Description */}
                  <p className="text-copy-14 text-gray-600 mt-2 line-clamp-3 leading-normal">
                    {workshop.description}
                  </p>

                  {/* Logistics */}
                  <div className="space-y-2 mt-4 border-t border-gray-200 pt-4 text-label-12 text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span className="font-medium text-gray-700">{formatDate(workshop.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⏰</span>
                      <span className="font-medium text-gray-700">{formatTime(workshop.time)} ({workshop.durationMinutes} min)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span className="font-sans font-medium text-gray-700">Mentor: <strong className="font-semibold">{workshop.mentorDisplayName}</strong></span>
                    </div>
                    {workshop.meetingType === 'ONLINE' ? (
                      <div className="flex items-center gap-2 truncate">
                        <span>🔗</span>
                        {workshop.meetingLink ? (
                          <a href={workshop.meetingLink} target="_blank" rel="noreferrer" className="text-tertiary hover:underline truncate">
                            {workshop.meetingLink}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">No link provided</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 truncate">
                        <span>📍</span>
                        <span className="font-sans font-medium text-gray-700 truncate">{workshop.location || 'Campus'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                  <span className="text-xs text-gray-500">
                    👥 <strong className="text-gray-700">{workshop.registrationCount}</strong> / {workshop.maxAttendees || '∞'} registered
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={`/workshops/${workshop.id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-background-100 hover:bg-gray-50 border border-gray-200 rounded-sm transition-colors"
                    >
                      Details
                    </a>
                    {isRegistered ? (
                      <button
                        type="button"
                        onClick={() => handleCancelRegistration(workshop.id)}
                        className="px-4 py-1.5 text-xs font-semibold rounded-sm border bg-green-50 text-green-800 border-green-300 hover:bg-red-50 hover:text-red-800 hover:border-red-300 transition-colors"
                      >
                        ✓ Registered
                      </button>
                    ) : isFull ? (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-1.5 text-xs font-semibold rounded-sm bg-gray-100 text-gray-450 border border-gray-200 cursor-not-allowed"
                      >
                        Full
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRegister(workshop.id)}
                        className="px-4 py-1.5 text-xs font-semibold rounded-sm bg-primary hover:bg-gray-800 text-background-100 transition-colors"
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
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button;;"
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
