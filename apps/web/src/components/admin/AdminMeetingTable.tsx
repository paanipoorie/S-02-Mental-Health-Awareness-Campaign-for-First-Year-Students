import { useState, useEffect } from 'react';

interface AdminMeetingTableProps {
  meetings: Array<{
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
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    hostType?: string;
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

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getHostTypeBadge(hostType: string) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      hostType === 'STUDENT'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-purple-100 text-purple-800'
    }`}>
      {hostType === 'STUDENT' ? '🎓 Student' : '👨‍🏫 Mentor'}
    </span>
  );
}

function getMeetingTypeBadge(meetingType: string) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      meetingType === 'ONLINE'
        ? 'bg-green-100 text-green-800'
        : 'bg-amber-100 text-amber-800'
    }`}>
      {meetingType === 'ONLINE' ? '🌐 Online' : '📍 Offline'}
    </span>
  );
}

function getCategoryBadge(category: string) {
  const categoryLabels: Record<string, string> = {
    STUDY_GROUP: '📚 Study Group',
    PEER_DISCUSSION: '💬 Peer Discussion',
    MENTOR_OFFICE_HOURS: '👨‍🏫 Office Hours',
    SOCIAL: '🎉 Social',
    WORKSHOP: '🛠️ Workshop',
    GENERAL: '📋 General',
  };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
      {categoryLabels[category] || category}
    </span>
  );
}

export function AdminMeetingTable({
  meetings,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onDelete,
  isLoading = false,
  search = '',
  onSearchChange,
}: AdminMeetingTableProps) {
  const handleSearchChange = (searchQuery: string) => {
    onSearchChange(searchQuery);
    setTimeout(() => {
      onFilterChange({ ...filters, search: searchQuery });
    }, 300);
  };

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  if (isLoading) {
    return (
      <div className="table-container">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Meeting</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Host</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendees</th>
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
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-slate-900">No meetings found</h3>
        <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="relative max-w-xs w-full">
          <label htmlFor="search" className="sr-only">Search meetings</label>
          <input
            type="search"
            id="search"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            id="host-type-filter"
            value={filters.hostType || ''}
            onChange={(e) => handleFilterChange('hostType', e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          >
            <option value="">All Host Types</option>
            <option value="STUDENT">Student</option>
            <option value="MENTOR">Mentor</option>
          </select>

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
            <option value="STUDY_GROUP">Study Group</option>
            <option value="PEER_DISCUSSION">Peer Discussion</option>
            <option value="MENTOR_OFFICE_HOURS">Mentor Office Hours</option>
            <option value="SOCIAL">Social</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="GENERAL">General</option>
          </select>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="upcoming-filter"
              checked={filters.upcoming}
              onChange={(e) => handleFilterChange('upcoming', String(e.target.checked))}
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Meeting</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Host</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendees</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">{meeting.title}</p>
                  <p className="text-sm text-slate-500 truncate max-w-xs">{meeting.description}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {getHostTypeBadge(meeting.hostType)}
                    <span className="text-sm text-slate-600">{meeting.hostDisplayName || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-4 py-4">{getMeetingTypeBadge(meeting.meetingType)}</td>
                <td className="px-4 py-4">{getCategoryBadge(meeting.category)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>📅 {formatDate(meeting.date)}</span>
                    <span>🕐 {formatTime(meeting.time)}</span>
                    <span>({meeting.durationMinutes} min)</span>
                  </div>
                  {meeting.meetingLink && (
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline">Join Link</a>
                  )}
                  {meeting.location && !meeting.meetingLink && (
                    <span className="text-xs text-slate-500">📍 {meeting.location}</span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{meeting.attendeeCount}</td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(meeting.id)}
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