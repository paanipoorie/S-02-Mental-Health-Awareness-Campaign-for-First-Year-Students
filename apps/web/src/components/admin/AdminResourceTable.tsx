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
  const categoryLabels: Record<string, { label: string; bg: string; text: string }> = {
    COUNSELING_CENTER: { label: '🏥 Counseling Center', bg: 'bg-blue-900/50 text-blue-300 border-blue-800/50', bgDark: 'bg-blue-100', text: 'text-blue-800' },
    EMERGENCY_CONTACTS: { label: '🚨 Emergency Contacts', bg: 'bg-red-900/50 text-red-300 border-red-800/50', bgDark: 'bg-red-100', text: 'text-red-800' },
    FACULTY_ADVISORS: { label: '👨‍🏫 Faculty Advisors', bg: 'bg-purple-900/50 text-purple-300 border-purple-800/50', bgDark: 'bg-purple-100', text: 'text-purple-800' },
    STUDENT_WELFARE: { label: '🤝 Student Welfare', bg: 'bg-green-900/50 text-green-300 border-green-800/50', bgDark: 'bg-green-100', text: 'text-green-800' },
    CAMPUS_CLUBS: { label: '🎪 Campus Clubs', bg: 'bg-amber-900/50 text-amber-300 border-amber-800/50', bgDark: 'bg-amber-100', text: 'text-amber-800' },
    SELF_HELP_PDFS: { label: '📄 Self-Help PDFs', bg: 'bg-indigo-900/50 text-indigo-300 border-indigo-800/50', bgDark: 'bg-indigo-100', text: 'text-indigo-800' },
    STRESS_MANAGEMENT: { label: '😌 Stress Management', bg: 'bg-teal-900/50 text-teal-300 border-teal-800/50', bgDark: 'bg-teal-100', text: 'text-teal-800' },
    SLEEP_HYGIENE: { label: '😴 Sleep Hygiene', bg: 'bg-violet-900/50 text-violet-300 border-violet-800/50', bgDark: 'bg-violet-100', text: 'text-violet-800' },
    EXTERNAL_HELPLINES: { label: '☎️ External Helplines', bg: 'bg-rose-900/50 text-rose-300 border-rose-800/50', bgDark: 'bg-rose-100', text: 'text-rose-800' },
  };
  const c = categoryLabels[category] || { label: category, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg}`}>
      {c.label}
    </span>
  );
}

function getStatusBadge(isActive: boolean) {
  return isActive ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-800/50">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900/50 text-slate-400 border border-slate-800">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
            <h2 id="modal-title" className="text-heading-20 font-semibold text-slate-100 font-sans">
              {initialData ? 'Edit Resource' : 'Create Resource'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto bg-slate-900/50">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-300 mb-1.5">Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                required
              />
              {errors.title && <p className="mt-1.5 text-xs text-rose-400">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-1.5">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
                required
              />
              {errors.description && <p className="mt-1.5 text-xs text-rose-400">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-300 mb-1.5">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
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
              <label htmlFor="content" className="block text-sm font-semibold text-slate-300 mb-1.5">Content *</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                required
              />
              {errors.content && <p className="mt-1.5 text-xs text-rose-400">{errors.content}</p>}
            </div>

            <div>
              <label htmlFor="link" className="block text-sm font-semibold text-slate-300 mb-1.5">External Link (optional)</label>
              <input
                type="url"
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
              {errors.link && <p className="mt-1.5 text-xs text-rose-400">{errors.link}</p>}
            </div>

            <div className="flex items-center gap-3 py-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4.5 h-4.5 text-teal-600 border-slate-805 bg-slate-950 rounded focus:ring-teal-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm font-medium text-slate-300">Active (visible to students)</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary text-button-14 px-4 py-2"
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
    <div className="dashboard-card border border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
        <div className="relative max-w-xs w-full">
          <label htmlFor="search" className="sr-only">Search resources</label>
          <input
            type="search"
            id="search"
            placeholder="Search resources..."
            value={search}
            className="w-full pl-10 pr-4 py-2 border border-slate-800 bg-slate-950 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            id="category-filter"
            value={filters.category || ''}
            className="px-3 py-2 border border-slate-800 bg-slate-950 text-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
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
            className="button-primary text-button-14 px-4 py-2"
          >
            + Add Resource
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="table-container">
            <table className="w-full text-slate-200" role="table">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-400">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr className="animate-pulse" key={i}>
                    <td className="px-4 py-4"><div className="h-4 w-48 bg-slate-800 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                    <td className="px-4 py-4 text-right"><div className="h-6 w-24 bg-slate-800 rounded mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-12 text-center border border-slate-800/40 rounded-xl">
            <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-3 text-sm font-semibold text-slate-300">No resources found</h3>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="w-full text-slate-200" role="table">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-400">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {resources.map(resource => (
                <tr className="hover:bg-slate-900/40 transition-colors" key={resource.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-200 text-sm">{resource.title}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{resource.description}</p>
                  </td>
                  <td className="px-4 py-4">{getCategoryBadge(resource.category)}</td>
                  <td className="px-4 py-4">{getStatusBadge(resource.isActive)}</td>
                  <td className="px-4 py-4 text-xs text-slate-400 font-medium">{formatDate(resource.createdAt)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(resource)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(resource.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-950/50 border border-red-900/50 rounded-lg hover:bg-red-900/60 transition-colors"
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
        <div className="flex items-center justify-between px-4 py-4 border-t border-slate-800 bg-slate-950/10">
          <p className="text-xs text-slate-400 font-medium">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
