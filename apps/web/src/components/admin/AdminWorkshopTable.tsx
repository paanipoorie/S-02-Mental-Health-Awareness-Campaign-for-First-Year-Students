import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Globe, MapPin, Brain, Smile, BookOpen, Clock, Sparkles, Briefcase, FileText, Calendar, Link as LinkIcon, Paperclip } from 'lucide-react';

interface Workshop {
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
  registrationCount: number;
  resources: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminWorkshopTableProps {
  workshops: Workshop[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    meetingType?: string;
    category?: string;
    upcoming?: boolean;
    search?: string;
  };
  onFilterChange: (filters: any) => void;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  search?: string;
  onSearchChange: (search: string) => void;
}

export function AdminWorkshopTable({
  workshops,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onDelete,
  isLoading,
  search,
  onSearchChange,
}: AdminWorkshopTableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getMeetingTypeBadge = (meetingType: string) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold border ${
      meetingType === 'ONLINE'
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      {meetingType === 'ONLINE' ? <><Globe className="h-3 w-3 inline mr-1" /> Online</> : <><MapPin className="h-3 w-3 inline mr-1" /> Offline</>}
    </span>
  );

  const getCategoryBadge = (category: string) => {
    const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
      MENTAL_HEALTH: { label: 'Mental Health', icon: <Brain className="h-3 w-3 inline mr-1" /> },
      STRESS_MANAGEMENT: { label: 'Stress Management', icon: <Smile className="h-3 w-3 inline mr-1" /> },
      STUDY_SKILLS: { label: 'Study Skills', icon: <BookOpen className="h-3 w-3 inline mr-1" /> },
      TIME_MANAGEMENT: { label: 'Time Management', icon: <Clock className="h-3 w-3 inline mr-1" /> },
      MINDFULNESS: { label: 'Mindfulness', icon: <Sparkles className="h-3 w-3 inline mr-1" /> },
      CAREER_GUIDANCE: { label: 'Career Guidance', icon: <Briefcase className="h-3 w-3 inline mr-1" /> },
      GENERAL: { label: 'General', icon: <FileText className="h-3 w-3 inline mr-1" /> },
    };
    const c = categoryLabels[category] || { label: category, icon: null };
    return <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold border border-gray-200 bg-gray-50 text-gray-700">{c.icon}{c.label}</span>;
  };

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  if (isLoading) {
    return (
      <div className="dashboard-card bg-background-100 border border-gray-200 rounded-sm">
        <div className="table-container">
          <table className="w-full text-copy-13" role="table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Workshop</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mentor</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Registrations</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-gray-200">
                  <td className="px-4 py-4"><div className="h-4 w-48 bg-gray-200 rounded-sm" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded-sm" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded-sm" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded-sm" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 rounded-sm" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-16 bg-gray-200 rounded-sm" /></td>
                  <td className="px-4 py-4 text-right"><div className="h-6 w-24 bg-gray-200 rounded-sm mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div className="dashboard-card bg-background-100 border border-gray-200 rounded-sm">
        <div className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-lg font-bold text-gray-1000">No workshops found</h3>
          <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card bg-background-100 border border-gray-200 rounded-sm">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-background-100 border-b border-gray-200 rounded-t-sm">
        <div className="relative max-w-xs w-full">
          <label htmlFor="search" className="sr-only">Search workshops</label>
          <input
            type="search"
            id="search"
            placeholder="Search workshops..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 border border-gray-200 rounded-sm text-xs font-semibold bg-background-100 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            id="meeting-type-filter"
            value={filters.meetingType || ''}
            onChange={(e) => handleFilterChange('meetingType', e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs font-semibold bg-background-100 outline-none focus:border-gray-900 transition-colors"
          >
            <option value="">All Types</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>

          <select
            id="category-filter"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs font-semibold bg-background-100 outline-none focus:border-gray-900 transition-colors"
          >
            <option value="">All Categories</option>
            <option value="MENTAL_HEALTH">Mental Health</option>
            <option value="STRESS_MANAGEMENT">Stress Management</option>
            <option value="STUDY_SKILLS">Study Skills</option>
            <option value="TIME_MANAGEMENT">Time Management</option>
            <option value="MINDFULNESS">Mindfulness</option>
            <option value="CAREER_GUIDANCE">Career Guidance</option>
            <option value="GENERAL">General</option>
          </select>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="upcoming-filter"
              checked={filters.upcoming}
              onChange={(e) => handleFilterChange('upcoming', e.target.checked.toString())}
              className="w-4 h-4 text-primary border-gray-200 rounded-sm focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-xs font-semibold text-gray-700">Upcoming only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-copy-13" role="table">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Workshop</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mentor</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Registrations</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {workshops.map((workshop) => (
              <tr key={workshop.id} className="hover:bg-gray-50 border-b border-gray-200 transition-colors">
                <td className="px-4 py-4">
                  <p className="font-semibold text-gray-900">{workshop.title}</p>
                  <p className="text-xs font-medium text-gray-500 truncate max-w-xs">{workshop.description}</p>
                  {workshop.resources && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 mt-1"><Paperclip className="h-3 w-3" /> {workshop.resources}</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs font-semibold text-gray-700">{workshop.mentorDisplayName}</span>
                </td>
                <td className="px-4 py-4">{getMeetingTypeBadge(workshop.meetingType)}</td>
                <td className="px-4 py-4">{getCategoryBadge(workshop.category)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    {' '}{formatDate(workshop.date)}
                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                    {' '}{formatTime(workshop.time)}
                    <span>({workshop.durationMinutes} min)</span>
                  </div>
                  {workshop.meetingLink && (
                    <a href={workshop.meetingLink} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-tertiary hover:underline block mt-1">Join Link</a>
                  )}
                  {workshop.location && !workshop.meetingLink && (
                    <span className="text-[11px] font-medium text-gray-500 block mt-1"><MapPin className="h-3 w-3 inline mr-0.5" /> {workshop.location}</span>
                  )}
                </td>
                <td className="px-4 py-4 text-xs font-semibold text-gray-700">
                  {workshop.registrationCount} / {workshop.maxAttendees || '\u221E'}
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(workshop.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-sm hover:bg-red-100 transition-colors"
                  >
                    Force Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-background-100 rounded-b-sm">
            <p className="text-xs font-medium text-gray-700">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-background-100 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-background-100 border border-gray-200 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
