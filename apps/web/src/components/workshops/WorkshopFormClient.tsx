import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';

export function WorkshopFormClient() {
  const user = useStore($user);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    durationMinutes: 60,
    meetingType: 'ONLINE',
    meetingLink: '',
    location: '',
    category: 'STRESS_MANAGEMENT',
    maxAttendees: '',
    resources: '',
  });

  useEffect(() => {
    async function checkUser() {
      if (!user) {
        await fetchCurrentUser();
      }
      setChecking(false);
    }
    checkUser();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to host a workshop.');
      }

      if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
        throw new Error('Only mentors can host workshops.');
      }

      // Format date to ISO datetime string
      const localDate = new Date(formData.date);
      if (isNaN(localDate.getTime())) {
        throw new Error('Please select a valid date.');
      }
      const isoDate = localDate.toISOString();

      const payload = {
        title: formData.title,
        description: formData.description,
        date: isoDate,
        time: formData.time,
        durationMinutes: Number(formData.durationMinutes),
        meetingType: formData.meetingType,
        meetingLink: formData.meetingType === 'ONLINE' ? formData.meetingLink || null : null,
        location: formData.meetingType === 'OFFLINE' ? formData.location || null : null,
        category: formData.category,
        maxAttendees: formData.maxAttendees ? Number(formData.maxAttendees) : null,
        resources: formData.resources || null,
      };

      await api.post('/workshops', payload);
      toast.success('Workshop scheduled successfully!');
      window.location.href = '/workshops';
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule workshop');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded-sm w-1/4" />
        <div className="h-10 bg-gray-200 rounded-sm w-full" />
      </div>
    );
  }

  const isAuthorized = user?.role === 'MENTOR' || user?.role === 'ADMIN';

  if (!isAuthorized) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <h2 className="text-heading-24 font-bold text-gray-900">Unauthorized</h2>
        <p className="text-copy-14 text-gray-500 mt-2">Only verified mentors and administrators can schedule workshops.</p>
        <a href="/workshops" className="mt-6 inline-block rounded-sm bg-primary px-5 py-2.5 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors">
          Back to Workshops
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <div>
        <a href="/workshops" className="text-label-14 font-semibold text-tertiary hover:underline flex items-center gap-1.5 transition-colors">
          ← Back to Workshops
        </a>
      </div>

      <div className="rounded-sm border border-gray-200 bg-background-100 p-6 sm:p-8 shadow-sm">
        <h1 className="text-heading-24 font-bold text-gray-1000 mb-1">
          Host a Workshop
        </h1>
        <p className="text-copy-14 text-gray-500 mb-6">
          Schedule a mentor-led workshop on mental health, sleep, welfare, or academics.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-label-12 font-bold text-gray-700 mb-1.5">Workshop Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-background-100 border border-gray-200 text-gray-900 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors placeholder-gray-400"
              placeholder="e.g. Stress Relief and Breathing Techniques"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-label-12 font-bold text-gray-700 mb-1.5">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2 bg-background-100 border border-gray-200 text-gray-900 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors placeholder-gray-400 resize-y"
              placeholder="Detail the agenda of this workshop."
              required
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-label-12 font-bold text-gray-700 mb-1.5">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-background-100 border border-gray-200 text-gray-750 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors cursor-pointer"
              >
                <option value="MENTAL_HEALTH">Mental Health</option>
                <option value="STRESS_MANAGEMENT">Stress Management</option>
                <option value="STUDY_SKILLS">Study Skills</option>
                <option value="TIME_MANAGEMENT">Time Management</option>
                <option value="MINDFULNESS">Mindfulness</option>
                <option value="CAREER_GUIDANCE">Career Guidance</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="block text-label-12 font-bold text-gray-700 mb-1.5">Duration (mins) *</label>
              <select
                id="duration"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-background-100 border border-gray-200 text-gray-750 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors cursor-pointer"
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={90}>1.5 Hours</option>
                <option value={120}>2 Hours</option>
                <option value={180}>3 Hours</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-label-12 font-bold text-gray-700 mb-1.5">Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-background-100 border border-gray-200 text-gray-750 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-label-12 font-bold text-gray-700 mb-1.5">Time (HH:mm) *</label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 bg-background-100 border border-gray-200 text-gray-750 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Max Attendees & Resources */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxAttendees" className="block text-label-12 font-bold text-gray-700 mb-1.5">Max Attendees (optional)</label>
              <input
                type="number"
                id="maxAttendees"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                className="w-full px-3.5 py-2 bg-background-100 border border-gray-200 text-gray-900 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors placeholder-gray-400"
                placeholder="Unlimited if empty"
                min={1}
              />
            </div>
            <div>
              <label htmlFor="resources" className="block text-label-12 font-bold text-gray-700 mb-1.5">Resources Info (optional)</label>
              <input
                type="text"
                id="resources"
                value={formData.resources}
                onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                className="w-full px-3.5 py-2 bg-background-100 border border-gray-200 text-gray-900 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors placeholder-gray-400"
                placeholder="Links, PDFs info, etc."
              />
            </div>
          </div>

          {/* Location Mode */}
          <div>
            <label className="block text-label-12 font-bold text-gray-700 mb-2">Location Mode *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name="meetingType"
                  value="ONLINE"
                  checked={formData.meetingType === 'ONLINE'}
                  onChange={() => setFormData({ ...formData, meetingType: 'ONLINE' })}
                  className="w-4 h-4 text-primary bg-background-100 border-gray-300 focus:ring-gray-900"
                />
                Online Link
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name="meetingType"
                  value="OFFLINE"
                  checked={formData.meetingType === 'OFFLINE'}
                  onChange={() => setFormData({ ...formData, meetingType: 'OFFLINE' })}
                  className="w-4 h-4 text-primary bg-background-100 border-gray-300 focus:ring-gray-900"
                />
                Physical Location
              </label>
            </div>
          </div>

          {/* Dynamic Link or Location inputs */}
          {formData.meetingType === 'ONLINE' ? (
            <div>
              <label htmlFor="meetingLink" className="block text-label-12 font-bold text-gray-700 mb-1.5">Meeting Link (optional)</label>
              <input
                type="url"
                id="meetingLink"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                className="w-full px-3.5 py-2 bg-background-100 border border-gray-200 text-gray-900 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors placeholder-gray-400"
                placeholder="https://zoom.us/j/12345678"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="location" className="block text-label-12 font-bold text-gray-700 mb-1.5">Campus Location (optional)</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2 bg-background-100 border border-gray-200 text-gray-900 rounded-sm text-sm focus:border-gray-900 outline-none transition-colors placeholder-gray-400"
                placeholder="e.g. Auditorium Hall C"
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-gray-250">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-gray-800 text-background-100 font-semibold rounded-sm text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scheduling workshop...' : 'Schedule Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
