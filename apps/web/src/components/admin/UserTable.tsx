import { useState, useEffect } from 'react';

interface User {
  id: string;
  universityEmail: string;
  role: string;
  isActive: boolean;
  isVerifiedMentor: boolean;
  createdAt: string;
  anonymousDisplayName: string | null;
  avatarSeed: number | null;
  department: string | null;
  bio: string | null;
  specialties: string[];
  availabilityStatus: string | null;
  lastSeenAt: string | null;
  _count: {
    posts: number;
    chatThreads: number;
    meetings: number;
    workshops: number;
  };
}

interface UserTableProps {
  users: User[];
  type: 'mentors' | 'students';
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  search: string;
  filters: Record<string, string>;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: Record<string, string>) => void;
  onVerifyMentor?: (userId: string, isVerified: boolean) => void;
  onToggleStatus?: (userId: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export function UserTable({
  users,
  type,
  pagination,
  search,
  filters,
  onPageChange,
  onSearchChange,
  onFilterChange,
  onVerifyMentor,
  onToggleStatus,
  isLoading,
}: UserTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const getVerificationBadge = (isVerified: boolean) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
      {isVerified ? '✅ Verified' : '⏳ Pending'}
    </span>
  );

  const getAvailabilityBadge = (status: string | null) => {
    if (!status) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">—</span>;
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      AVAILABLE: { bg: 'bg-green-100', text: 'text-green-800', label: '🟢 Available' },
      BUSY: { bg: 'bg-amber-100', text: 'text-amber-800', label: '🟡 Busy' },
      OFFLINE: { bg: 'bg-slate-100', text: 'text-slate-600', label: '⚫ Offline' },
    };
    const s = statusMap[status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const getAvatarSeed = (seed: number | null) => {
    if (!seed) return '👤';
    const avatars = ['🐦', '🦅', '🦉', '🦜', '🐧', '🦢', '🦩', '🐤'];
    return avatars[seed % avatars.length];
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                {type === 'mentors' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Availability</th>
                  </>
                )}
                {type === 'students' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Posts</th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div>
                        <div className="h-4 w-32 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-200 rounded mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  {type === 'mentors' && (
                    <>
                      <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    </>
                  )}
                  {type === 'students' && (
                    <>
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
                    </>
                  )}
                  <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="px-4 py-4 text-right"><div className="h-6 w-24 bg-slate-200 rounded mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-900">No users found</h3>
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
          <label htmlFor="search" className="sr-only">Search users</label>
          <input
            type="search"
            id="search"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {type === 'mentors' && (
            <>
              <select
                id="verification-filter"
                value={filters.isVerified || ''}
                onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="">All Verification</option>
                <option value="true">Verified Only</option>
                <option value="false">Pending Only</option>
              </select>
              <select
                id="availability-filter"
                value={filters.availabilityStatus || ''}
                onChange={(e) => handleFilterChange('availabilityStatus', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="">All Availability</option>
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </>
          )}
          {type === 'students' && (
            <select
              id="status-filter"
              value={filters.isActive || ''}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              {type === 'mentors' && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Availability</th>
                </>
              )}
              {type === 'students' && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Posts</th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl" aria-hidden="true">
                      {getAvatarSeed(user.avatarSeed)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{user.anonymousDisplayName || 'Anonymous'}</p>
                      <p className="text-sm text-slate-500 truncate max-w-xs">{user.universityEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {user.role === 'MENTOR' ? '👨‍🏫 Mentor' : user.role === 'STUDENT' ? '🎓 Student' : '🛡️ Admin'}
                  </span>
                </td>
                {type === 'mentors' && (
                  <>
                    <td className="px-4 py-4 text-sm text-slate-600">{user.department || '—'}</td>
                    <td className="px-4 py-4">{getVerificationBadge(user.isVerifiedMentor)}</td>
                    <td className="px-4 py-4">{getAvailabilityBadge(user.availabilityStatus)}</td>
                  </>
                )}
                {type === 'students' && (
                  <>
                    <td className="px-4 py-4">{getStatusBadge(user.isActive)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{user._count.posts}</td>
                  </>
                )}
                <td className="px-4 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {type === 'mentors' && onVerifyMentor && (
                      <button
                        type="button"
                        onClick={() => onVerifyMentor(user.id, !user.isVerifiedMentor)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          user.isVerifiedMentor
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {user.isVerifiedMentor ? 'Unverify' : 'Verify'}
                      </button>
                    )}
                    {type === 'students' && onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user.id, !user.isActive)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          user.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
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

export default UserTable;