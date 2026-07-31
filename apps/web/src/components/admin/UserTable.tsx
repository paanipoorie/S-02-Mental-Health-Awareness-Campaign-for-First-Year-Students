import { Users, GraduationCap, Briefcase, Shield, CheckCircle, Clock, Circle, User, Bird } from 'lucide-react';

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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold border ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const getVerificationBadge = (isVerified: boolean) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold border ${isVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
      {isVerified ? <><CheckCircle className="h-3 w-3 inline mr-0.5" /> Verified</> : <><Clock className="h-3 w-3 inline mr-0.5 animate-pulse" /> Pending</>}
    </span>
  );

  const getAvailabilityBadge = (status: string | null) => {
    if (!status) return <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-200">&mdash;</span>;
    const statusMap: Record<string, { bg: string; text: string; border: string; label: React.ReactNode }> = {
      AVAILABLE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: <><Circle className="h-3 w-3 inline mr-0.5 fill-green-500 text-green-500" /> Available</> },
      BUSY: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: <><Circle className="h-3 w-3 inline mr-0.5 fill-amber-500 text-amber-500" /> Busy</> },
      OFFLINE: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: <><Circle className="h-3 w-3 inline mr-0.5 fill-gray-400 text-gray-400" /> Offline</> },
    };
    const s = statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: status };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold border ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>;
  };

  const getAvatarSeed = (seed: number | null) => {
    if (!seed) return <User className="h-5 w-5 text-gray-500" />;
    const avatars = [User, Bird];
    const IconComponent = avatars[seed % avatars.length];
    return <IconComponent className="h-5 w-5 text-gray-600" />;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
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
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                {type === 'mentors' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Verification</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Availability</th>
                  </>
                )}
                {type === 'students' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Posts</th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-gray-200">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div>
                        <div className="h-4 w-32 bg-gray-200 rounded-sm" />
                        <div className="h-3 w-24 bg-gray-200 rounded-sm mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded-sm" /></td>
                  {type === 'mentors' && (
                    <>
                      <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded-sm" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded-sm" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded-sm" /></td>
                    </>
                  )}
                  {type === 'students' && (
                    <>
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded-sm" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-12 bg-gray-200 rounded-sm" /></td>
                    </>
                  )}
                  <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded-sm" /></td>
                  <td className="px-4 py-4 text-right"><div className="h-6 w-24 bg-gray-200 rounded-sm mx-auto" /></td>
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
      <div className="dashboard-card bg-background-100 border border-gray-200 rounded-sm">
        <div className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-bold text-gray-1000">No users found</h3>
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
          <label htmlFor="search" className="sr-only">Search users</label>
          <input
            type="search"
            id="search"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-1.5 border border-gray-200 rounded-sm text-xs font-semibold bg-background-100 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs font-semibold bg-background-100 outline-none focus:border-gray-900 transition-colors"
              >
                <option value="">All Verification</option>
                <option value="true">Verified Only</option>
                <option value="false">Pending Only</option>
              </select>
              <select
                id="availability-filter"
                value={filters.availabilityStatus || ''}
                onChange={(e) => handleFilterChange('availabilityStatus', e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs font-semibold bg-background-100 outline-none focus:border-gray-900 transition-colors"
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
              className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs font-semibold bg-background-100 outline-none focus:border-gray-900 transition-colors"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-copy-13" role="table">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
              {type === 'mentors' && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Verification</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Availability</th>
                </>
              )}
              {type === 'students' && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Posts</th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 border-b border-gray-200 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-sm bg-gray-100 flex items-center justify-center border border-gray-200" aria-hidden="true">
                      {getAvatarSeed(user.avatarSeed)}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{user.anonymousDisplayName || 'Anonymous'}</p>
                      <p className="text-xs font-medium text-gray-500 truncate max-w-xs">{user.universityEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold border border-gray-200 bg-gray-50 text-gray-700">
                    {user.role === 'MENTOR' ? <><Briefcase className="h-3 w-3 inline mr-1" /> Mentor</> : user.role === 'STUDENT' ? <><GraduationCap className="h-3 w-3 inline mr-1" /> Student</> : <><Shield className="h-3 w-3 inline mr-1" /> Admin</>}
                  </span>
                </td>
                {type === 'mentors' && (
                  <>
                    <td className="px-4 py-4 text-xs font-medium text-gray-700">{user.department || '\u2014'}</td>
                    <td className="px-4 py-4">{getVerificationBadge(user.isVerifiedMentor)}</td>
                    <td className="px-4 py-4">{getAvailabilityBadge(user.availabilityStatus)}</td>
                  </>
                )}
                {type === 'students' && (
                  <>
                    <td className="px-4 py-4">{getStatusBadge(user.isActive)}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-700">{user._count.posts}</td>
                  </>
                )}
                <td className="px-4 py-4 text-xs font-mono text-gray-500">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {type === 'mentors' && onVerifyMentor && (
                      <button
                        type="button"
                        onClick={() => onVerifyMentor(user.id, !user.isVerifiedMentor)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                          user.isVerifiedMentor
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {user.isVerifiedMentor ? 'Unverify' : 'Verify'}
                      </button>
                    )}
                    {type === 'students' && onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user.id, !user.isActive)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                          user.isActive
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
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

export default UserTable;
