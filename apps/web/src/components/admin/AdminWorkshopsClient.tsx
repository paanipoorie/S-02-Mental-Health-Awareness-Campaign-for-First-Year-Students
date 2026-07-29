import { useEffect, useState } from 'react';
import { adminApi } from '@lib/api';
import { AdminWorkshopTable } from './AdminWorkshopTable';
import { toast } from 'sonner';

interface WorkshopData {
  data: Array<{
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
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function AdminWorkshopsClient({ initialData }: { initialData: WorkshopData }) {
  const [workshops, setWorkshops] = useState(initialData.data);
  const [pagination, setPagination] = useState(initialData.pagination);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchWorkshops = async (page: number, searchQuery: string, filterOptions: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await adminApi.getWorkshops({
        page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        meetingType: filterOptions.meetingType || undefined,
        category: filterOptions.category || undefined,
        upcoming: filterOptions.upcoming === 'true' ? true : filterOptions.upcoming === 'false' ? false : undefined,
      });
      setWorkshops(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch workshops');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workshopId: string) => {
    if (!confirm('Are you sure you want to force delete this workshop? This action cannot be undone.')) return;
    try {
      await adminApi.deleteWorkshop(workshopId);
      toast.success('Workshop deleted successfully');
      fetchWorkshops(pagination.page, search, filters);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete workshop');
    }
  };

  const handlePageChange = (page: number) => {
    fetchWorkshops(page, search, filters);
  };

  const handleSearchChange = (searchQuery: string) => {
    setSearch(searchQuery);
    setTimeout(() => {
      fetchWorkshops(1, searchQuery, filters);
    }, 300);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    fetchWorkshops(1, search, newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-24 font-bold text-slate-900">Workshop Management</h1>
          <p className="text-copy-14 text-slate-500 mt-1">View and manage all platform workshops</p>
        </div>
      </div>

      <AdminWorkshopTable
        workshops={workshops}
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

export default AdminWorkshopsClient;