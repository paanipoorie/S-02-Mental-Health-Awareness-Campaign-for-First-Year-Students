import { useEffect, useState } from 'react';
import { adminApi } from '@lib/api';
import { AdminMeetingTable } from './AdminMeetingTable';
import { toast } from 'sonner';

interface MeetingData {
  data: Array<{
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
}

export function AdminMeetingsClient({ initialData }: { initialData?: MeetingData }) {
  const [meetings, setMeetings] = useState(initialData?.data || []);
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  );
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      fetchMeetings(1, '', {});
    }
  }, [initialData]);

  const fetchMeetings = async (
    page: number,
    searchQuery: string,
    filterOptions: Record<string, string>
  ) => {
    setLoading(true);
    try {
      const response = await adminApi.getMeetings({
        page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        hostType: filterOptions.hostType || undefined,
        meetingType: filterOptions.meetingType || undefined,
        category: filterOptions.category || undefined,
        upcoming:
          filterOptions.upcoming === 'true'
            ? true
            : filterOptions.upcoming === 'false'
              ? false
              : undefined,
      });
      setMeetings(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetingId: string) => {
    if (
      !confirm('Are you sure you want to force delete this meeting? This action cannot be undone.')
    )
      return;
    try {
      await adminApi.deleteMeeting(meetingId);
      toast.success('Meeting deleted successfully');
      fetchMeetings(pagination.page, search, filters);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete meeting');
    }
  };

  const handlePageChange = (page: number) => {
    fetchMeetings(page, search, filters);
  };

  const handleSearchChange = (searchQuery: string) => {
    setSearch(searchQuery);
    setTimeout(() => {
      fetchMeetings(1, searchQuery, filters);
    }, 300);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    fetchMeetings(1, search, newFilters);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-heading-24 text-gray-1000 font-bold">Meeting Management</h1>
          <p className="text-copy-14 mt-1 text-gray-600">View and manage all platform meetings</p>
        </div>
      </div>

      <AdminMeetingTable
        meetings={meetings}
        pagination={pagination}
        filters={filters}
        search={search}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onDelete={handleDelete}
        isLoading={loading}
      />
    </div>
  );
}

export default AdminMeetingsClient;
