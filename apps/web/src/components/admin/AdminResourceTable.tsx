import { useState, useEffect } from 'react';
import { ResourceCategory } from '@campus-peer-support/shared-types/enums';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  link: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminResourceTableProps {
  resources: Resource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    category?: string;
    isActive?: boolean;
  };
  search: string;
  onFilterChange: (filters: any) => void;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  isLoading?: boolean;
  modalOpen?: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  initialData?: Resource | null;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getCategoryBadge(category: string) {
  const categoryLabels: Record<string, { label: string; bg: string; border: string; text: string }> = {
    COUNSELING_CENTER: { label: '🏥 Counseling Center', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    EMERGENCY_CONTACTS: { label: '🚨 Emergency Contacts', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    FACULTY_ADVISORS: { label: '👨‍🏫 Faculty Advisors', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    STUDENT_WELFARE: { label: '🤝 Student Welfare', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    CAMPUS_CLUBS: { label: '🎪 Campus Clubs', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    SELF_HELP_PDFS: { label: '📄 Self-Help PDFs', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
    STRESS_MANAGEMENT: { label: '😌 Stress Management', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
    SLEEP_HYGIENE: { label: '😴 Sleep Hygiene', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
    EXTERNAL_HELPLINES: { label: '☎️ External Helplines', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  };
  const c = categoryLabels[category] || { label: category, bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold border ${c.bg} ${c.border} ${c.text}`}>
      {c.label}
    </span>
  );
}

function getStatusBadge(isActive: boolean) {
  return isActive ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-200">
      Inactive
    </span>
  );
}

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  initialData?: Resource | null;
}

function ResourceFormModal({ isOpen, onClose, onSubmit, initialData }: ResourceFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'COUNSELING_CENTER',
    content: '',
    link: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        content: initialData.content,
        link: initialData.link || '',
        isActive: initialData.isActive,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'COUNSELING_CENTER',
        content: '',
        link: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.link && !isValidUrl(formData.link)) newErrors.link = 'Invalid URL format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-2xl bg-background-100 border border-gray-200 rounded-sm shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-background-100">
            <h2 id="modal-title" className="text-heading-16 font-bold text-gray-1000">
              {initialData ? 'Edit Resource' : 'Create Resource'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-sm hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto bg-background-100">
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-gray-700 mb-1.5">Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-1.5 bg-background-100 border border-gray-200 rounded-sm text-xs font-semibold text-gray-900 focus:border-gray-900 outline-none transition-colors"
                required
              />
              {errors.title && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold text-gray-700 mb-1.5">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-1.5 bg-background-100 border border-gray-200 rounded-sm text-xs font-semibold text-gray-900 focus:border-gray-900 outline-none transition-colors resize-none"
                required
              />
              {errors.description && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-bold text-gray-700 mb-1.5">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-1.5 bg-background-100 border border-gray-200 rounded-sm text-xs font-semibold text-gray-900 focus:border-gray-900 outline-none transition-colors"
              >
                <option value="COUNSELING_CENTER">Counseling Center</option>
                <option value="EMERGENCY_CONTACTS">Emergency Contacts</option>
                <option value="FACULTY_ADVISORS">Faculty Advisors</option>
                <option value="STUDENT_WELFARE">Student Welfare</option>
                <option value="CAMPUS_CLUBS">Campus Clubs</option>
                <option value="SELF_HELP_PDFS">Self-Help PDFs</option>
                <option value="STRESS_MANAGEMENT">Stress Management</option>
                <option value="SLEEP_HYGIENE">Sleep Hygiene</option>
                <option value="EXTERNAL_HELPLINES">External Helplines</option>
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-xs font-bold text-gray-700 mb-1.5">Content *</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full px-3 py-1.5 bg-background-100 border border-gray-200 rounded-sm text-xs font-semibold text-gray-900 focus:border-gray-900 outline-none transition-colors"
                required
              />
              {errors.content && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.content}</p>}
            </div>

            <div>
              <label htmlFor="link" className="block text-xs font-bold text-gray-700 mb-1.5">External Link (optional)</label>
              <input
                type="url"
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-1.5 bg-background-100 border border-gray-200 rounded-sm text-xs font-semibold text-gray-900 focus:border-gray-900 outline-none transition-colors"
              />
              {errors.link && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.link}</p>}
            </div>

            <div className="flex items-center gap-3 py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-200 bg-background-100 rounded-sm focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs font-semibold text-gray-700">Active (visible to students)</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-background-100 hover:bg-gray-50 rounded-sm border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary text-button-12 px-4 py-1.5 rounded-sm"
              >
                {initialData ? 'Save Changes' : 'Create Resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminResourceTable({
  resources,
  pagination,
  filters,
  search,
  onFilterChange,
  onPageChange,
  onSearchChange,
  onEdit,
  onDelete,
  onCreate,
  isLoading,
  modalOpen,
  onClose,
  onSubmit,
  initialData,
}: AdminResourceTableProps) {
  return (
    <div className="dashboard-card bg-background-100 border border-gray-200 rounded-sm">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-background-100 border-b border-gray-200 rounded-t-sm">
        <div className="relative max-w-xs w-full">
          <label htmlFor="search" className="sr-only">Search resources</label>
          <input
            type="search"
            id="search"
            placeholder="Search resources..."
            value={search}
            className="w-full pl-10 pr-4 py-1.5 border border-gray-200 rounded-sm text-xs font-semibold bg-background-100 placeholder-gray-400 text-gray-900 outline-none focus:border-gray-900 transition-colors"
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            id="category-filter"
            value={filters.category || ''}
            className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs font-semibold bg-background-100 outline-none focus:border-gray-900 transition-colors"
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="COUNSELING_CENTER">Counseling Center</option>
            <option value="EMERGENCY_CONTACTS">Emergency Contacts</option>
            <option value="FACULTY_ADVISORS">Faculty Advisors</option>
            <option value="STUDENT_WELFARE">Student Welfare</option>
            <option value="CAMPUS_CLUBS">Campus Clubs</option>
            <option value="SELF_HELP_PDFS">Self-Help PDFs</option>
            <option value="STRESS_MANAGEMENT">Stress Management</option>
            <option value="SLEEP_HYGIENE">Sleep Hygiene</option>
            <option value="EXTERNAL_HELPLINES">External Helplines</option>
          </select>

          <button
            type="button"
            onClick={onCreate}
            className="button-primary text-button-12 px-4 py-1.5 rounded-sm"
          >
            + Add Resource
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-4 pb-4">
        {isLoading ? (
          <div className="table-container">
            <table className="w-full text-copy-13" role="table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr className="animate-pulse border-b border-gray-200" key={i}>
                    <td className="px-4 py-4"><div className="h-4 w-48 bg-gray-200 rounded-sm" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded-sm" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded-sm" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded-sm" /></td>
                    <td className="px-4 py-4 text-right"><div className="h-6 w-24 bg-gray-200 rounded-sm mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-12 text-center border border-gray-200 rounded-sm bg-background-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-lg font-bold text-gray-1000">No resources found</h3>
            <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="w-full text-copy-13" role="table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resources.map(resource => (
                <tr className="hover:bg-gray-50 border-b border-gray-200 transition-colors" key={resource.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900 text-xs">{resource.title}</p>
                    <p className="text-xs text-gray-600 truncate max-w-xs mt-0.5">{resource.description}</p>
                  </td>
                  <td className="px-4 py-4">{getCategoryBadge(resource.category)}</td>
                  <td className="px-4 py-4">{getStatusBadge(resource.isActive)}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 font-mono font-medium">{formatDate(resource.createdAt)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(resource)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-background-100 hover:bg-gray-50 rounded-sm border border-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(resource.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-sm hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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

      {/* Resource Form Modal */}
      <ResourceFormModal
        isOpen={!!modalOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={initialData}
      />
    </div>
  );
}

export default AdminResourceTable;
