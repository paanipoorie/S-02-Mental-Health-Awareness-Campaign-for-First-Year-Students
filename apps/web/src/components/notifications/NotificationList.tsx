import { MessageSquare, Mail, Calendar, Wrench, Briefcase, CheckCircle, Heart, Bell } from 'lucide-react';
import type { ReactNode } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type: string): ReactNode {
  const icons: Record<string, ReactNode> = {
    NEW_REPLY: <MessageSquare className="h-5 w-5 text-slate-500" />,
    NEW_CHAT_MESSAGE: <Mail className="h-5 w-5 text-slate-500" />,
    MEETING_REMINDER: <Calendar className="h-5 w-5 text-slate-500" />,
    WORKSHOP_REMINDER: <Wrench className="h-5 w-5 text-slate-500" />,
    MENTOR_ASSIGNED: <Briefcase className="h-5 w-5 text-slate-500" />,
    POST_REPLY_MENTOR: <CheckCircle className="h-5 w-5 text-slate-500" />,
    EMOTION_CHECKED: <Heart className="h-5 w-5 text-slate-500" />,
  };
  return icons[type] || <Bell className="h-5 w-5 text-slate-500" />;
}

function getNotificationLink(notification: Notification): string | null {
  const payload = notification.payload as Record<string, any> | null;
  if (!payload) return null;

  switch (notification.type) {
    case 'NEW_REPLY':
      return payload.postId ? `/posts/${payload.postId}` : null;
    case 'NEW_CHAT_MESSAGE':
      return payload.chatId ? `/chat/${payload.chatId}` : null;
    case 'MENTOR_ASSIGNED':
      return payload.chatId ? `/chat/${payload.chatId}` : null;
    case 'MEETING_REMINDER':
      return payload.meetingId ? `/meetings/${payload.meetingId}` : null;
    case 'WORKSHOP_REMINDER':
      return payload.workshopId ? `/workshops/${payload.workshopId}` : null;
    default:
      return null;
  }
}

export function NotificationList({ notifications, onMarkAsRead, onClose }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="mt-2 text-sm font-medium text-slate-700">No notifications yet</p>
        <p className="mt-1 text-xs text-slate-500">
          Notifications will appear here when someone replies to your post or sends you a message.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 max-h-[28rem] overflow-y-auto">
      {notifications.map((notification) => {
        const link = getNotificationLink(notification);
        const Container = link ? 'a' : 'button';
        const containerProps = link
          ? { href: link, onClick: () => { onMarkAsRead(notification.id); onClose(); } }
          : { onClick: () => onMarkAsRead(notification.id) };

        return (
          <Container
            key={notification.id}
            {...containerProps}
            className={`w-full text-left block px-4 py-3 transition-colors ${
              notification.isRead ? 'bg-white hover:bg-slate-50' : 'bg-amber-50/50 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0" aria-hidden="true">
                {getNotificationIcon(notification.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm ${notification.isRead ? 'text-slate-700' : 'text-slate-900 font-semibold'}`}>
                    {notification.title}
                  </p>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.body}</p>
              </div>
              {!notification.isRead && (
                <span className="w-2 h-2 mt-2 bg-amber-500 rounded-full flex-shrink-0" aria-label="Unread" />
              )}
            </div>
          </Container>
        );
      })}
    </div>
  );
}
