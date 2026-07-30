import { useEffect, useState } from 'react';
import { adminApi } from '@lib/api';
import { UserTable } from '@components/admin/UserTable';
import { toast } from 'sonner';

interface UserData {
  data: Array<{
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
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function AdminStudentsClient({ initialData }: { initialData?: UserData }) {
  const [users, setUsers] = useState(initialData?.data || []);
  const [pagination, setPagination] = useState(initialData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      fetchUsers(1, '', {});
    }
  }, [initialData]);

  const fetchUsers = async (page: number, searchQuery: string, filterOptions: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers({
        page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        isActive: filterOptions.isActive === 'true' ? true : filterOptions.isActive === 'false' ? false : undefined,
      });
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    if (!confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this student?`)) return;
    try {
      await adminApi.updateUserStatus(userId, isActive);
      toast.success(isActive ? 'Student activated successfully' : 'Student deactivated successfully');
      fetchUsers(pagination.page, search, filters);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update student status');
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, search, filters);
  };

  const handleSearchChange = (searchQuery: string) => {
    setSearch(searchQuery);
    setTimeout(() => {
      fetchUsers(1, searchQuery, filters);
    }, 300);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    fetchUsers(1, search, newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-24 font-bold text-gray-1000">Student Management</h1>
          <p className="text-copy-14 text-gray-600 mt-1">View and manage student accounts</p>
        </div>
      </div>

      <UserTable
        users={users}
        type="students"
        pagination={pagination}
        search={search}
        filters={filters}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onToggleStatus={handleToggleStatus}
        isLoading={loading}
      />
    </div>
  );
}

export default AdminStudentsClient;