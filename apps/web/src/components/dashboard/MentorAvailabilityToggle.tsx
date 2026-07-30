import { useState } from 'react';
import { dashboardApi } from '@lib/api';

interface MentorAvailabilityToggleProps {
  initialAvailability: string;
  className?: string;
  onChange?: (status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available', icon: '🟢', style: 'bg-green-50 border-green-300 text-green-800' },
  { value: 'BUSY', label: 'Busy', icon: '🟡', style: 'bg-amber-50 border-amber-300 text-amber-800' },
  { value: 'OFFLINE', label: 'Offline', icon: '⚫', style: 'bg-gray-100 border-gray-300 text-gray-800' },
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
      <h3 className="text-heading-20 mb-4 text-gray-1000 font-semibold">Availability Status</h3>

      <div className="mb-4 flex items-center gap-4 rounded-sm border border-gray-200 bg-background-100 p-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-sm bg-gray-100 border border-gray-200 text-gray-700"
        >
          <span className="text-xl">{currentStatus.icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-label-12 text-gray-500 font-medium">Current Status</p>
          <p className="text-copy-14 font-semibold text-gray-900">{currentStatus.label}</p>
        </div>
        {loading && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {STATUS_OPTIONS.map(option => {
          const isSelected = availability === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleChange(option.value)}
              disabled={loading || isSelected}
              className={`flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold transition-all ${
                isSelected
                  ? `border ${option.style} shadow-sm`
                  : 'border border-gray-200 bg-background-100 text-gray-700 hover:bg-gray-50'
              } disabled:cursor-not-allowed disabled:opacity-80`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-3 rounded-sm border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <p className="text-label-12 mt-4 text-gray-500 leading-normal">
        Students can see your availability status when requesting support. Set to <strong>Available</strong> to receive new chat requests.
      </p>
    </div>
  );
}
