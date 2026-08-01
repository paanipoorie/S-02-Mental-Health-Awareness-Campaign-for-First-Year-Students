import { useState, useEffect } from 'react';
import { ResourceCategory } from '@campus-peer-support/shared-types/enums';
import {
  Building2,
  Phone,
  Briefcase,
  Handshake,
  Tent,
  FileText,
  Smile,
  Moon,
  PhoneCall,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';

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
  pagination: { page: number; limit: number; total: number; totalPages: number };
  filters: { category?: string; isActive?: boolean };
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
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getCategoryBadge(category: string) {
  const categoryLabels: Record<
    string,
    { label: string; icon: ReactNode; bg: string; border: string; text: string }
  > = {
    COUNSELING_CENTER: {
      label: 'Counseling Center',
      icon: <Building2 className="mr-1 inline h-3 w-3" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
    },
    EMERGENCY_CONTACTS: {
      label: 'Emergency Contacts',
      icon: <Phone className="mr-1 inline h-3 w-3" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
    },
    FACULTY_ADVISORS: {
      label: 'Faculty Advisors',
      icon: <Briefcase className="mr-1 inline h-3 w-3" />,
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
    },
    STUDENT_WELFARE: {
      label: 'Student Welfare',
      icon: <Handshake className="mr-1 inline h-3 w-3" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
    },
    CAMPUS_CLUBS: {
      label: 'Campus Clubs',
      icon: <Tent className="mr-1 inline h-3 w-3" />,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
    },
    SELF_HELP_PDFS: {
      label: 'Self-Help PDFs',
      icon: <FileText className="mr-1 inline h-3 w-3" />,
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
    },
    STRESS_MANAGEMENT: {
      label: 'Stress Management',
      icon: <Smile className="mr-1 inline h-3 w-3" />,
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-700',
    },
    SLEEP_HYGIENE: {
      label: 'Sleep Hygiene',
      icon: <Moon className="mr-1 inline h-3 w-3" />,
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-700',
    },
    EXTERNAL_HELPLINES: {
      label: 'External Helplines',
      icon: <PhoneCall className="mr-1 inline h-3 w-3" />,
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
    },
  };
  const c = categoryLabels[category] || {
    label: category,
    icon: null,
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${c.bg} ${c.border} ${c.text}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function getStatusBadge(isActive: boolean) {
  return isActive ? (
    <span className="inline-flex items-center rounded-sm border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
      <CheckCircle className="mr-1 inline h-3 w-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-500">
      <XCircle className="mr-1 inline h-3 w-3" /> Inactive
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
    if (validateForm()) onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="bg-background-100 relative w-full max-w-2xl overflow-hidden rounded-sm border border-gray-200 shadow-xl">
          <div className="bg-background-100 flex items-center justify-between border-b border-gray-200 p-4">
            <h2 id="modal-title" className="text-heading-16 text-gray-1000 font-bold">
              {initialData ? 'Edit Resource' : 'Create Resource'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-background-100 max-h-[70vh] space-y-5 overflow-y-auto p-6"
          >
            <div>
              <label htmlFor="title" className="mb-1.5 block text-xs font-bold text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="bg-background-100 w-full rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-900 outline-none transition-colors focus:border-gray-900"
                required
              />
              {errors.title && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.title}</p>
              )}
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-xs font-bold text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="bg-background-100 w-full resize-none rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-900 outline-none transition-colors focus:border-gray-900"
                required
              />
              {errors.description && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.description}</p>
              )}
            </div>
            <div>
              <label htmlFor="category" className="mb-1.5 block text-xs font-bold text-gray-700">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="bg-background-100 w-full rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-900 outline-none transition-colors focus:border-gray-900"
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
              <label htmlFor="content" className="mb-1.5 block text-xs font-bold text-gray-700">
                Content *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="bg-background-100 w-full rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-900 outline-none transition-colors focus:border-gray-900"
                required
              />
              {errors.content && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.content}</p>
              )}
            </div>
            <div>
              <label htmlFor="link" className="mb-1.5 block text-xs font-bold text-gray-700">
                External Link (optional)
              </label>
              <input
                type="url"
                id="link"
                value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com"
                className="bg-background-100 w-full rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-900 outline-none transition-colors focus:border-gray-900"
              />
              {errors.link && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.link}</p>
              )}
            </div>
            <div className="flex items-center gap-3 py-1">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="text-primary bg-background-100 h-4 w-4 rounded-sm border-gray-200 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Active (visible to students)
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-background-100 rounded-sm border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary text-button-12 rounded-sm px-4 py-1.5"
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
    <div className="dashboard-card bg-background-100 rounded-sm border border-gray-200">
      <div className="bg-background-100 mb-6 flex flex-col gap-4 rounded-t-sm border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <label htmlFor="search" className="sr-only">
            Search resources
          </label>
          <input
            type="search"
            id="search"
            placeholder="Search resources..."
            value={search}
            className="bg-background-100 w-full rounded-sm border border-gray-200 py-1.5 pl-10 pr-4 text-xs font-semibold text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
            onChange={e => onSearchChange(e.target.value)}
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
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            id="category-filter"
            value={filters.category || ''}
            className="bg-background-100 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold outline-none transition-colors focus:border-gray-900"
            onChange={e => onFilterChange({ ...filters, category: e.target.value })}
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
        </div>
      </div>

      <div className="overflow-x-auto px-4 pb-4">
        {isLoading ? (
          <div className="table-container">
            <table className="text-copy-13 w-full" role="table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr className="animate-pulse border-b border-gray-200" key={i}>
                    <td className="px-4 py-4">
                      <div className="h-4 w-48 rounded-sm bg-gray-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 rounded-sm bg-gray-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 rounded-sm bg-gray-200" />
                    </td>
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
        ) : resources.length === 0 ? (
          <div className="bg-background-100 rounded-sm border border-gray-200 py-12 text-center">
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-gray-1000 mt-2 text-lg font-bold">No resources found</h3>
            <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="text-copy-13 w-full" role="table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Resource
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {resources.map(resource => (
                <tr
                  className="border-b border-gray-200 transition-colors hover:bg-gray-50"
                  key={resource.id}
                >
                  <td className="px-4 py-4">
                    <p className="text-xs font-semibold text-gray-900">{resource.title}</p>
                    <p className="mt-0.5 max-w-xs truncate text-xs text-gray-600">
                      {resource.description}
                    </p>
                  </td>
                  <td className="px-4 py-4">{getCategoryBadge(resource.category)}</td>
                  <td className="px-4 py-4">{getStatusBadge(resource.isActive)}</td>
                  <td className="px-4 py-4 font-mono text-xs font-medium text-gray-500">
                    {formatDate(resource.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(resource)}
                        className="bg-background-100 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(resource.id)}
                        className="rounded-sm border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
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
