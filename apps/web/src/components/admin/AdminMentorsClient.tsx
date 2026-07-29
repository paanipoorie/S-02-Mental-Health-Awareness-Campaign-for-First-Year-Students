import { useEffect, useState } from 'react';
import { adminApi } from '@lib/api';
import { UserTable } from '@components/admin/UserTable';
import { toast } from 'sonner';

interface MentorData {
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

export function AdminMentorsClient({ initialData }: { initialData?: MentorData }) {
  const [mentors, setMentors] = useState(initialData?.data || []);
  const [pagination, setPagination] = useState(initialData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      fetchMentors(1, '', {});
    }
  }, [initialData]);

  const fetchMentors = async (page: number, searchQuery: string, filterOptions: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await adminApi.getMentors({
        page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        isVerified: filterOptions.isVerified === 'true' ? true : filterOptions.isVerified === 'false' ? false : undefined,
        availabilityStatus: filterOptions.availabilityStatus || undefined,
      });
      setMentors(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMentor = async (userId: string, isVerified: boolean) => {
    try {
      await adminApi.verifyMentor(userId, isVerified);
      toast.success(isVerified ? 'Mentor verified successfully' : 'Mentor unverified successfully');
      fetchMentors(pagination.page, search, filters);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update mentor verification');
    }
  };

  const handlePageChange = (page: number) => {
    fetchMentors(page, search, filters);
  };

  const handleSearchChange = (searchQuery: string) => {
    setSearch(searchQuery);
    setTimeout(() => {
      fetchMentors(1, searchQuery, filters);
    }, 300);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    fetchMentors(1, search, newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-24 font-bold text-slate-900">Mentor Management</h1>
          <p className="text-copy-14 text-slate-500 mt-1">Manage mentor verification and view mentor details</p>
        </div>
      </div>

      <UserTable
        users={mentors}
        type="mentors"
        pagination={pagination}
        search={search}
        filters={filters}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onVerifyMentor={handleVerifyMentor}
        isLoading={loading}
      />
    </div>
  );
}

export default AdminMentorsClient;