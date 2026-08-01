import {
  Users,
  GraduationCap,
  Briefcase,
  Shield,
  CheckCircle,
  Clock,
  Circle,
  User,
  Bird,
} from 'lucide-react';

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
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${isActive ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const getVerificationBadge = (isVerified: boolean) => (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${isVerified ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}
    >
      {isVerified ? (
        <>
          <CheckCircle className="mr-0.5 inline h-3 w-3" /> Verified
        </>
      ) : (
        <>
          <Clock className="mr-0.5 inline h-3 w-3 animate-pulse" /> Pending
        </>
      )}
    </span>
  );

  const getAvailabilityBadge = (status: string | null) => {
    if (!status)
      return (
        <span className="inline-flex items-center rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-500">
          &mdash;
        </span>
      );
    const statusMap: Record<
      string,
      { bg: string; text: string; border: string; label: React.ReactNode }
    > = {
      AVAILABLE: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        label: (
          <>
            <Circle className="mr-0.5 inline h-3 w-3 fill-green-500 text-green-500" /> Available
          </>
        ),
      },
      BUSY: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: (
          <>
            <Circle className="mr-0.5 inline h-3 w-3 fill-amber-500 text-amber-500" /> Busy
          </>
        ),
      },
      OFFLINE: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        label: (
          <>
            <Circle className="mr-0.5 inline h-3 w-3 fill-gray-400 text-gray-400" /> Offline
          </>
        ),
      },
    };
    const s = statusMap[status] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      label: status,
    };
    return (
      <span
        className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${s.bg} ${s.text} ${s.border}`}
      >
        {s.label}
      </span>
    );
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
      <div className="dashboard-card bg-background-100 rounded-sm border border-gray-200">
        <div className="table-container">
          <table className="text-copy-13 w-full" role="table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Role
                </th>
                {type === 'mentors' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Verification
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Availability
                    </th>
                  </>
                )}
                {type === 'students' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                      Posts
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-gray-200">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div>
                        <div className="h-4 w-32 rounded-sm bg-gray-200" />
                        <div className="mt-1 h-3 w-24 rounded-sm bg-gray-200" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-20 rounded-sm bg-gray-200" />
                  </td>
                  {type === 'mentors' && (
                    <>
                      <td className="px-4 py-4">
                        <div className="h-4 w-24 rounded-sm bg-gray-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-24 rounded-sm bg-gray-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-20 rounded-sm bg-gray-200" />
                      </td>
                    </>
                  )}
                  {type === 'students' && (
                    <>
                      <td className="px-4 py-4">
                        <div className="h-4 w-20 rounded-sm bg-gray-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-12 rounded-sm bg-gray-200" />
                      </td>
                    </>
                  )}
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 rounded-sm bg-gray-200" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="mx-auto h-6 w-24 rounded-sm bg-gray-200" />
                  </td>
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
      <div className="dashboard-card bg-background-100 rounded-sm border border-gray-200">
        <div className="py-12 text-center">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-gray-1000 mt-2 text-lg font-bold">No users found</h3>
          <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card bg-background-100 rounded-sm border border-gray-200">
      {/* Toolbar */}
      <div className="bg-background-100 mb-6 flex flex-col gap-4 rounded-t-sm border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <label htmlFor="search" className="sr-only">
            Search users
          </label>
          <input
            type="search"
            id="search"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={handleSearchChange}
            className="bg-background-100 w-full rounded-sm border border-gray-200 py-1.5 pl-10 pr-4 text-xs font-semibold placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {type === 'mentors' && (
            <>
              <select
                id="verification-filter"
                value={filters.isVerified || ''}
                onChange={e => handleFilterChange('isVerified', e.target.value)}
                className="bg-background-100 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold outline-none transition-colors focus:border-gray-900"
              >
                <option value="">All Verification</option>
                <option value="true">Verified Only</option>
                <option value="false">Pending Only</option>
              </select>
              <select
                id="availability-filter"
                value={filters.availabilityStatus || ''}
                onChange={e => handleFilterChange('availabilityStatus', e.target.value)}
                className="bg-background-100 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold outline-none transition-colors focus:border-gray-900"
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
              onChange={e => handleFilterChange('isActive', e.target.value)}
              className="bg-background-100 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold outline-none transition-colors focus:border-gray-900"
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
        <table className="text-copy-13 w-full" role="table">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                Role
              </th>
              {type === 'mentors' && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Verification
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Availability
                  </th>
                </>
              )}
              {type === 'students' && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Posts
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                Joined
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr
                key={user.id}
                className="border-b border-gray-200 transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-200 bg-gray-100"
                      aria-hidden="true"
                    >
                      {getAvatarSeed(user.avatarSeed)}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user.anonymousDisplayName || 'Anonymous'}
                      </p>
                      <p className="max-w-xs truncate text-xs font-medium text-gray-500">
                        {user.universityEmail}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-700">
                    {user.role === 'MENTOR' ? (
                      <>
                        <Briefcase className="mr-1 inline h-3 w-3" /> Mentor
                      </>
                    ) : user.role === 'STUDENT' ? (
                      <>
                        <GraduationCap className="mr-1 inline h-3 w-3" /> Student
                      </>
                    ) : (
                      <>
                        <Shield className="mr-1 inline h-3 w-3" /> Admin
                      </>
                    )}
                  </span>
                </td>
                {type === 'mentors' && (
                  <>
                    <td className="px-4 py-4 text-xs font-medium text-gray-700">
                      {user.department || '\u2014'}
                    </td>
                    <td className="px-4 py-4">{getVerificationBadge(user.isVerifiedMentor)}</td>
                    <td className="px-4 py-4">{getAvailabilityBadge(user.availabilityStatus)}</td>
                  </>
                )}
                {type === 'students' && (
                  <>
                    <td className="px-4 py-4">{getStatusBadge(user.isActive)}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-700">
                      {user._count.posts}
                    </td>
                  </>
                )}
                <td className="px-4 py-4 font-mono text-xs text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {type === 'mentors' && onVerifyMentor && (
                      <button
                        type="button"
                        onClick={() => onVerifyMentor(user.id, !user.isVerifiedMentor)}
                        className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          user.isVerifiedMentor
                            ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {user.isVerifiedMentor ? 'Unverify' : 'Verify'}
                      </button>
                    )}
                    {type === 'students' && onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user.id, !user.isActive)}
                        className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          user.isActive
                            ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                            : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
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
          <div className="bg-background-100 flex items-center justify-between rounded-b-sm border-t border-gray-200 px-4 py-4">
            <p className="text-xs font-medium text-gray-700">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="bg-background-100 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="bg-background-100 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
