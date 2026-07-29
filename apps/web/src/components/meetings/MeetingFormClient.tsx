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
      window.location.href = '/meetings';
    } catch (err: any) {
      toast.error(err.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <div>
        <a href="/meetings" className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors">
          ← Back to Meetings
        </a>
      </div>

      <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-200 to-purple-400 font-sans tracking-tight mb-2">
          Host a Meeting
        </h1>
        <p className="text-xs text-slate-450 mb-6">
          Schedule a group session, peer discussion, or check-in with other students.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Meeting Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="e.g. Midterm prep study group"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
              placeholder="What will we discuss? Any pre-requisites?"
              required
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              >
                <option value="STUDY_GROUP">Study Group</option>
                <option value="PEER_DISCUSSION">Peer Discussion</option>
                <option value="SOCIAL">Social Event</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Duration (mins) *</label>
              <select
                id="duration"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
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
              <label htmlFor="date" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Time (HH:mm) *</label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Location Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Location Mode *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input
                  type="radio"
                  name="meetingType"
                  value="ONLINE"
                  checked={formData.meetingType === 'ONLINE'}
                  onChange={() => setFormData({ ...formData, meetingType: 'ONLINE' })}
                  className="w-4 h-4 text-teal-600 bg-slate-950 border-slate-800 focus:ring-teal-500"
                />
                Online Link
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input
                  type="radio"
                  name="meetingType"
                  value="OFFLINE"
                  checked={formData.meetingType === 'OFFLINE'}
                  onChange={() => setFormData({ ...formData, meetingType: 'OFFLINE' })}
                  className="w-4 h-4 text-teal-600 bg-slate-950 border-slate-800 focus:ring-teal-500"
                />
                Physical Location
              </label>
            </div>
          </div>

          {/* Dynamic Link or Location inputs */}
          {formData.meetingType === 'ONLINE' ? (
            <div>
              <label htmlFor="meetingLink" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Meeting Link (optional)</label>
              <input
                type="url"
                id="meetingLink"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="https://meet.google.com/abc-defg-hij"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Campus Location (optional)</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="e.g. Student Center Room 204"
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-slate-900/60">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating meeting...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
