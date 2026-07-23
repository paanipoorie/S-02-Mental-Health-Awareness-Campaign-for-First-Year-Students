import type { FormEvent } from 'react';
import { useState } from 'react';
import { api } from '../../lib/api.js';

interface MentorProfile {
  department: string;
  bio: string;
  specialties: string[];
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}

interface Props {
  initialProfile: MentorProfile;
}

export function MentorProfileForm({ initialProfile }: Props) {
  const [formData, setFormData] = useState<MentorProfile>({
    department: initialProfile.department,
    bio: initialProfile.bio,
    specialties: initialProfile.specialties,
    availabilityStatus: initialProfile.availabilityStatus,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [specialtyInput, setSpecialtyInput] = useState('');

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    setFormData(prev => ({ ...prev, [target.name]: target.value }));
  };

  const addSpecialty = () => {
    const trimmed = specialtyInput.trim();
    if (trimmed && formData.specialties.length < 10 && !formData.specialties.includes(trimmed)) {
      setFormData(prev => ({ ...prev, specialties: [...prev.specialties, trimmed] }));
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({ ...prev, specialties: prev.specialties.filter(s => s !== specialty) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.patch('/mentors/me/profile', {
        department: formData.department,
        bio: formData.bio,
        specialties: formData.specialties,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      setMessage({
        type: 'error',
        text: err.response?.data?.error?.message ?? 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityChange = async (status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => {
    setFormData(prev => ({ ...prev, availabilityStatus: status }));
    try {
      await api.patch('/mentors/me/availability', { availabilityStatus: status });
      setMessage({ type: 'success', text: `Availability updated to ${status}` });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      setMessage({
        type: 'error',
        text: err.response?.data?.error?.message ?? 'Failed to update availability',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      {message && (
        <div
          class={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <div>
        <label
          htmlFor="department"
          class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Department
        </label>
        <input
          type="text"
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          class="focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="e.g., Computer Science, Psychology, Student Affairs"
        />
      </div>

      <div>
        <label
          htmlFor="bio"
          class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          class="focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Tell students about yourself, your experience, and how you can help..."
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Specialties
        </label>
        <div class="mb-2 flex flex-wrap gap-2">
          {formData.specialties.map(specialty => (
            <span
              key={specialty}
              class="bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm"
            >
              {specialty}
              <button
                type="button"
                onClick={() => removeSpecialty(specialty)}
                class="hover:text-primary-900 dark:hover:text-primary-100"
                aria-label={`Remove ${specialty}`}
              >
                <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div class="flex gap-2">
          <input
            type="text"
            value={specialtyInput}
            onChange={e => setSpecialtyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
            class="focus:ring-primary-500 flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Add a specialty (e.g., Anxiety, Career Guidance)"
            maxLength={50}
          />
          <button
            type="button"
            onClick={addSpecialty}
            disabled={formData.specialties.length >= 10 || !specialtyInput.trim()}
            class="bg-primary-600 hover:bg-primary-700 rounded-md px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.specialties.length}/10 specialties • Press Enter to add
        </p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Availability Status
        </label>
        <div class="flex flex-wrap gap-3">
          {(['AVAILABLE', 'BUSY', 'OFFLINE'] as const).map(status => (
            <button
              key={status}
              type="button"
              onClick={() => handleAvailabilityChange(status)}
              class={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                formData.availabilityStatus === status
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div class="border-t border-gray-200 pt-4 dark:border-gray-700">
        <button
          type="submit"
          disabled={saving}
          class="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 w-full rounded-lg px-6 py-3 font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
