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
      window.location.href = '/events';
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule workshop');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="mx-auto max-w-xl animate-pulse space-y-4 px-4 py-12">
        <div className="h-4 w-1/4 rounded-sm bg-gray-200" />
        <div className="h-10 w-full rounded-sm bg-gray-200" />
      </div>
    );
  }

  const isAuthorized = user?.role === 'MENTOR' || user?.role === 'ADMIN';

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-heading-24 font-bold text-gray-900">Unauthorized</h2>
        <p className="text-copy-14 mt-2 text-gray-500">
          Only verified mentors and administrators can schedule workshops.
        </p>
        <a
          href="/events"
          className="bg-primary text-button-14 text-background-100 mt-6 inline-block rounded-sm px-5 py-2.5 font-semibold transition-colors hover:bg-gray-800"
        >
          Back to Events
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div>
        <a
          href="/events"
          className="text-label-14 text-tertiary flex items-center gap-1.5 font-semibold transition-colors hover:underline"
        >
          ← Back to Events
        </a>
      </div>

      <div className="bg-background-100 rounded-sm border border-gray-200 p-6 shadow-sm sm:p-8">
        <h1 className="text-heading-24 text-gray-1000 mb-1 font-bold">Host a Workshop</h1>
        <p className="text-copy-14 mb-6 text-gray-500">
          Schedule a mentor-led workshop on mental health, sleep, welfare, or academics.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="text-label-12 mb-1.5 block font-bold text-gray-700">
              Workshop Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="bg-background-100 w-full rounded-sm border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
              placeholder="e.g. Stress Relief and Breathing Techniques"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="text-label-12 mb-1.5 block font-bold text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="bg-background-100 w-full resize-y rounded-sm border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
              placeholder="Detail the agenda of this workshop."
              required
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="text-label-12 mb-1.5 block font-bold text-gray-700"
              >
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="bg-background-100 text-gray-750 w-full cursor-pointer rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900"
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
              <label
                htmlFor="duration"
                className="text-label-12 mb-1.5 block font-bold text-gray-700"
              >
                Duration (mins) *
              </label>
              <select
                id="duration"
                value={formData.durationMinutes}
                onChange={e =>
                  setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                }
                className="bg-background-100 text-gray-750 w-full cursor-pointer rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900"
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
              <label htmlFor="date" className="text-label-12 mb-1.5 block font-bold text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="bg-background-100 text-gray-750 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="text-label-12 mb-1.5 block font-bold text-gray-700">
                Time (HH:mm) *
              </label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="bg-background-100 text-gray-750 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900"
                required
              />
            </div>
          </div>

          {/* Max Attendees & Resources */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="maxAttendees"
                className="text-label-12 mb-1.5 block font-bold text-gray-700"
              >
                Max Attendees (optional)
              </label>
              <input
                type="number"
                id="maxAttendees"
                value={formData.maxAttendees}
                onChange={e => setFormData({ ...formData, maxAttendees: e.target.value })}
                className="bg-background-100 w-full rounded-sm border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
                placeholder="Unlimited if empty"
                min={1}
              />
            </div>
            <div>
              <label
                htmlFor="resources"
                className="text-label-12 mb-1.5 block font-bold text-gray-700"
              >
                Resources Info (optional)
              </label>
              <input
                type="text"
                id="resources"
                value={formData.resources}
                onChange={e => setFormData({ ...formData, resources: e.target.value })}
                className="bg-background-100 w-full rounded-sm border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
                placeholder="Links, PDFs info, etc."
              />
            </div>
          </div>

          {/* Location Mode */}
          <div>
            <label className="text-label-12 mb-2 block font-bold text-gray-700">
              Location Mode *
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="meetingType"
                  value="ONLINE"
                  checked={formData.meetingType === 'ONLINE'}
                  onChange={() => setFormData({ ...formData, meetingType: 'ONLINE' })}
                  className="text-primary bg-background-100 h-4 w-4 border-gray-300 focus:ring-gray-900"
                />
                Online Link
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="meetingType"
                  value="OFFLINE"
                  checked={formData.meetingType === 'OFFLINE'}
                  onChange={() => setFormData({ ...formData, meetingType: 'OFFLINE' })}
                  className="text-primary bg-background-100 h-4 w-4 border-gray-300 focus:ring-gray-900"
                />
                Physical Location
              </label>
            </div>
          </div>

          {/* Dynamic Link or Location inputs */}
          {formData.meetingType === 'ONLINE' ? (
            <div>
              <label
                htmlFor="meetingLink"
                className="text-label-12 mb-1.5 block font-bold text-gray-700"
              >
                Meeting Link (optional)
              </label>
              <input
                type="url"
                id="meetingLink"
                value={formData.meetingLink}
                onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                className="bg-background-100 w-full rounded-sm border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
                placeholder="https://zoom.us/j/12345678"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="location"
                className="text-label-12 mb-1.5 block font-bold text-gray-700"
              >
                Campus Location (optional)
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="bg-background-100 w-full rounded-sm border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
                placeholder="e.g. Auditorium Hall C"
              />
            </div>
          )}

          {/* Submit */}
          <div className="border-gray-250 border-t pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-background-100 w-full rounded-sm py-2.5 text-sm font-semibold transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Scheduling workshop...' : 'Schedule Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
