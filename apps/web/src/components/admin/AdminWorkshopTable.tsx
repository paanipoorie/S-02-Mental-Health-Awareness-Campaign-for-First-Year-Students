import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      meetingType === 'ONLINE'
        ? 'bg-green-100 text-green-800'
        : 'bg-amber-100 text-amber-800'
    }`}>
      {meetingType === 'ONLINE' ? '🌐 Online' : '📍 Offline'}
    </span>
  );

  const getCategoryBadge = (category: string) => {
    const categoryLabels: Record<string, string> = {
      MENTAL_HEALTH: '🧠 Mental Health',
      STRESS_MANAGEMENT: '😌 Stress Management',
      STUDY_SKILLS: '📚 Study Skills',
      TIME_MANAGEMENT: '⏰ Time Management',
      MINDFULNESS: '🧘 Mindfulness',
      CAREER_GUIDANCE: '💼 Career Guidance',
      GENERAL: '📋 General',
    };
    const label = categoryLabels[category] || category;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{label}</span>;
  };

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="table-container">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Workshop</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrations</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 w-48 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-4 text-right"><div className="h-6 w-24 bg-slate-200 rounded mx-auto" /></td>
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
      <div className="dashboard-card">
        <div className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-900">No workshops found</h3>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="relative max-w-xs w-full">
          <label htmlFor="search" className="sr-only">Search workshops</label>
          <input
            type="search"
            id="search"
            placeholder="Search workshops..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            id="meeting-type-filter"
            value={filters.meetingType || ''}
            onChange={(e) => handleFilterChange('meetingType', e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>

          <select
            id="category-filter"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
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
              className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm text-slate-700">Upcoming only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Workshop</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrations</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {workshops.map((workshop) => (
              <tr key={workshop.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">{workshop.title}</p>
                  <p className="text-sm text-slate-500 truncate max-w-xs">{workshop.description}</p>
                  {workshop.resources && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 mt-1">📎 {workshop.resources}</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-slate-600">{workshop.mentorDisplayName}</span>
                </td>
                <td className="px-4 py-4">{getMeetingTypeBadge(workshop.meetingType)}</td>
                <td className="px-4 py-4">{getCategoryBadge(workshop.category)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>📅 {formatDate(workshop.date)}</span>
                    <span>🕐 {formatTime(workshop.time)}</span>
                    <span>({workshop.durationMinutes} min)</span>
                  </div>
                  {workshop.meetingLink && (
                    <a href={workshop.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline">Join Link</a>
                  )}
                  {workshop.location && !workshop.meetingLink && (
                    <span className="text-xs text-slate-500">📍 {workshop.location}</span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {workshop.registrationCount} / {workshop.maxAttendees || '∞'}
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(workshop.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors"
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
          <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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