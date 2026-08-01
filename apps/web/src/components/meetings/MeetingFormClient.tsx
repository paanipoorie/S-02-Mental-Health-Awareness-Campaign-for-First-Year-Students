import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';

export function MeetingFormClient() {
  const user = useStore($user);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    durationMinutes: 60,
    meetingType: 'ONLINE',
    meetingLink: '',
    location: '',
    category: 'STUDY_GROUP',
  });

  useEffect(() => {
    async function checkUser() {
      if (!user) {
        await fetchCurrentUser();
      }
    }
    checkUser();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to host a meeting.');
      }

      // Format date to ISO datetime string
      const localDate = new Date(formData.date);
      if (isNaN(localDate.getTime())) {
        throw new Error('Please select a valid date.');
      }
      const isoDate = localDate.toISOString();

      // Dynamic host type setting
      const hostType = user.role === 'MENTOR' ? 'MENTOR' : 'STUDENT';

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
        hostType,
      };

      await api.post('/meetings', payload);
      toast.success('Meeting scheduled successfully!');
      window.location.href = '/events';
    } catch (err: any) {
      toast.error(err.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-heading-24 text-gray-1000 mb-1 font-bold">Host a Meeting</h1>
        <p className="text-copy-14 mb-6 text-gray-500">
          Schedule a group session, peer discussion, or check-in with other students.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="text-label-12 mb-1.5 block font-bold text-gray-700">
              Meeting Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="bg-background-100 w-full rounded-sm border border-gray-200 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
              placeholder="e.g. Midterm prep study group"
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
              placeholder="What will we discuss? Any pre-requisites?"
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
                <option value="STUDY_GROUP">Study Group</option>
                <option value="PEER_DISCUSSION">Peer Discussion</option>
                <option value="SOCIAL">Social Event</option>
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
                placeholder="https://meet.google.com/abc-defg-hij"
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
                placeholder="e.g. Student Center Room 204"
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
              {loading ? 'Creating meeting...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
