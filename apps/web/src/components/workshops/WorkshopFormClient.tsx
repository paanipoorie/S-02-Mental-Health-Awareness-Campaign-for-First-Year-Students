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
      <div className="max-w-xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
        <div className="h-10 bg-slate-800 rounded w-full" />
      </div>
    );
  }

  const isAuthorized = user?.role === 'MENTOR' || user?.role === 'ADMIN';

  if (!isAuthorized) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-200 font-sans">Unauthorized</h2>
        <p className="text-sm text-slate-500 mt-2">Only verified mentors and administrators can schedule workshops.</p>
        <a href="/workshops" className="button-primary text-button-14 mt-6 inline-block rounded-xl px-4 py-2">
          Back to Workshops
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <div>
        <a href="/workshops" className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors">
          ← Back to Workshops
        </a>
      </div>

      <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-200 to-purple-400 font-sans tracking-tight mb-2">
          Host a Workshop
        </h1>
        <p className="text-xs text-slate-450 mb-6">
          Schedule a mentor-led workshop on mental health, sleep, welfare, or academics.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Workshop Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="e.g. Stress Relief and Breathing Techniques"
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
              placeholder="Detail the agenda of this workshop."
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
                <option value={180}>3 Hours</option>
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

          {/* Max Attendees & Resources */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxAttendees" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Max Attendees (optional)</label>
              <input
                type="number"
                id="maxAttendees"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="Unlimited if empty"
                min={1}
              />
            </div>
            <div>
              <label htmlFor="resources" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Resources Info (optional)</label>
              <input
                type="text"
                id="resources"
                value={formData.resources}
                onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="Links, PDFs info, etc."
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
                placeholder="https://zoom.us/j/12345678"
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
                placeholder="e.g. Auditorium Hall C"
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
              {loading ? 'Scheduling workshop...' : 'Schedule Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
