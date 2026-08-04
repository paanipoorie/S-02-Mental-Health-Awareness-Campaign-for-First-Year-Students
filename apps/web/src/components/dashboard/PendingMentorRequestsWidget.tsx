import React, { useState } from 'react';
import { UserCheck, UserX, Clock } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { toast } from 'sonner';

interface PendingMentor {
  id: string;
  displayName: string | null;
  universityEmail: string;
  createdAt: string;
}

interface PendingMentorRequestsWidgetProps {
  initialMentors?: PendingMentor[];
  className?: string;
}

export function PendingMentorRequestsWidget({
  initialMentors = [],
  className = '',
}: PendingMentorRequestsWidgetProps) {
  const [pendingMentors, setPendingMentors] = useState<PendingMentor[]>(initialMentors);

  const handleApprove = async (mentorId: string) => {
    try {
      await adminApi.verifyMentor(mentorId, true);
      toast.success('Mentor approved and verified successfully');
      setPendingMentors(prev => prev.filter(m => m.id !== mentorId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve mentor');
    }
  };

  const handleReject = async (mentorId: string) => {
    try {
      // Rejection deactivates the account (no permanent deletion) and is audited.
      await adminApi.rejectMentor(mentorId);
      toast.success('Mentor request rejected and account deactivated');
      setPendingMentors(prev => prev.filter(m => m.id !== mentorId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject mentor');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (pendingMentors.length === 0) {
    return (
      <div className={`dashboard-card bg-background-100 rounded-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-heading-16 text-gray-1000 mb-4 font-bold">Pending Mentor Requests</h3>
        <div className="py-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <p className="text-copy-14 mt-3 font-semibold text-gray-900">No pending mentor requests</p>
          <p className="text-label-12 mt-1 text-gray-500">New mentor applications requiring verification will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card bg-background-100 rounded-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-16 text-gray-1000 font-bold">Pending Mentor Requests</h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-1.5 text-xs font-bold text-amber-700 animate-pulse">
          {pendingMentors.length}
        </span>
      </div>

      <div className="space-y-4">
        {pendingMentors.map(mentor => (
          <div key={mentor.id} className="bg-background-100 rounded-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-copy-14 font-semibold text-gray-900">
{mentor.displayName || 'Not available'}
                  </h4>
                  <span className="inline-flex items-center rounded-sm bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    <Clock className="mr-0.5 h-3 w-3" /> Pending Review
                  </span>
                </div>
                <p className="text-copy-13 mt-1 font-medium text-gray-600 truncate">
                  {mentor.universityEmail}
                </p>
                <p className="text-label-12 mt-1 text-gray-400">
                  Registered: {formatDate(mentor.createdAt)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(mentor.id)}
                  className="inline-flex items-center gap-1 cursor-pointer rounded-sm border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  onClick={() => handleReject(mentor.id)}
                  className="inline-flex items-center gap-1 cursor-pointer rounded-sm border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <UserX className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
