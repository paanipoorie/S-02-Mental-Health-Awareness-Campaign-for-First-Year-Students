import { useState, useEffect } from 'react';
import { dashboardApi } from '@lib/api';

interface MentorAvailabilityToggleProps {
  initialAvailability: string;
  className?: string;
  onChange?: (status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available', icon: '🟢', color: 'bg-green-500' },
  { value: 'BUSY', label: 'Busy', icon: '🟡', color: 'bg-amber-500' },
  { value: 'OFFLINE', label: 'Offline', icon: '⚫', color: 'bg-slate-500' },
] as const;

export function MentorAvailabilityToggle({
  initialAvailability,
  className = '',
  onChange,
}: MentorAvailabilityToggleProps) {
  const [availability, setAvailability] = useState<string>(initialAvailability);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStatus = STATUS_OPTIONS.find(s => s.value === availability) || STATUS_OPTIONS[0];

  const handleChange = async (newStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      await dashboardApi.updateMentorAvailability(newStatus);
      setAvailability(newStatus);
      onChange?.(newStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-20 mb-4 text-slate-100">Availability Status</h3>

      <div className="mb-4 flex items-center gap-4 rounded-lg border border-slate-800/50 bg-slate-900/50 p-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${currentStatus.color}`}
        >
          <span className="text-xl">{currentStatus.icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-label-14 text-slate-400">Current Status</p>
          <p className="text-copy-14 font-semibold text-slate-100">{currentStatus.label}</p>
        </div>
        {loading && (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-400" />
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => handleChange(option.value)}
            disabled={loading || availability === option.value}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              availability === option.value
                ? `${option.color} text-white shadow-lg`
                : 'border border-slate-700/50 bg-slate-900/50 text-slate-300 hover:border-slate-600/50 hover:bg-slate-800/50'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <p className="text-label-12 mt-4 text-slate-500">
        Students can see your availability status when requesting support.
        <br />
        Set to <strong>Available</strong> to receive new chat requests.
      </p>
    </div>
  );
}
