import { useEffect, useState } from 'react';
import { getSocket } from '@lib/socket';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface ToastNotification extends Notification {
  visible: boolean;
}

export function NotificationToast() {
  const [toast, setToast] = useState<ToastNotification | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const handleNewNotification = (notification: Notification) => {
      setToast({ ...notification, visible: true });
      setTimeout(() => {
        setToast(prev => prev ? { ...prev, visible: false } : null);
      }, 5000);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, []);

  if (!toast || !toast.visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 p-4 animate-slide-up transition-all duration-300"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0" role="img" aria-hidden="true">
          {toast.type === 'NEW_REPLY' ? '💬' : toast.type === 'NEW_CHAT_MESSAGE' ? '✉️' : toast.type === 'MENTOR_ASSIGNED' ? '👨‍🏫' : '🔔'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{toast.body}</p>
        </div>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
