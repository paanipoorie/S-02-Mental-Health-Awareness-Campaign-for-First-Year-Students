import { useEffect, useState } from 'react';
import { adminApi } from '@lib/api';
import AdminResourceTable from '@components/admin/AdminResourceTable';
import { toast } from 'sonner';

interface ResourceData {
  data: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    content: string;
    link: string | null;
    isActive: boolean;
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

export function AdminResourcesClient({ initialData }: { initialData?: ResourceData }) {
  const [resources, setResources] = useState(initialData?.data || []);
  const [pagination, setPagination] = useState(
    initialData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  );
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      fetchResources(1, '', {});
    }
  }, [initialData]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);

  const fetchResources = async (
    page: number,
    searchQuery: string,
    filterOptions: Record<string, string>
  ) => {
    setLoading(true);
    try {
      const response = await adminApi.getResources({
        page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        category: filterOptions.category || undefined,
        isActive:
          filterOptions.isActive === 'true'
            ? true
            : filterOptions.isActive === 'false'
              ? false
              : undefined,
      });
      setResources(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingResource(null);
    setModalOpen(true);
  };

  const handleEdit = (resource: any) => {
    setEditingResource(resource);
    setModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingResource) {
        await adminApi.updateResource(editingResource.id, formData);
        toast.success('Resource updated successfully');
      } else {
        await adminApi.createResource(formData);
        toast.success('Resource created successfully');
      }
      setModalOpen(false);
      fetchResources(pagination.page, search, filters);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.'))
      return;
    try {
      await adminApi.deleteResource(resourceId);
      toast.success('Resource deleted successfully');
      fetchResources(pagination.page, search, filters);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete resource');
    }
  };

  const handlePageChange = (page: number) => {
    fetchResources(page, search, filters);
  };

  const handleSearchChange = (searchQuery: string) => {
    setSearch(searchQuery);
    setTimeout(() => {
      fetchResources(1, searchQuery, filters);
    }, 300);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    fetchResources(1, search, newFilters);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-24 text-gray-1000 font-bold">Resource Management</h1>
          <p className="text-copy-14 mt-1 text-gray-600">
            Manage mental health resources for students
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="button-primary text-button-14 mt-4 rounded-sm px-4 py-2 sm:mt-0"
        >
          + Add Resource
        </button>
      </div>

      <AdminResourceTable
        resources={resources}
        pagination={pagination}
        filters={filters}
        search={search}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        isLoading={loading}
        modalOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingResource}
      />
    </div>
  );
}

export default AdminResourcesClient;
