import { useState } from 'react';
import { X, Bell, Trophy, MessageCircle, Clock, AlertCircle } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'session',
    title: 'Upcoming Session',
    description: 'Your morning strength session starts in 30 minutes',
    timeAgo: 'just now',
    read: false,
  },
  {
    id: 2,
    type: 'badge',
    title: 'Badge Earned!',
    description: 'You earned the "5 Sessions" achievement',
    timeAgo: '2h ago',
    read: false,
    icon: Trophy,
  },
  {
    id: 3,
    type: 'message',
    title: 'Message from PT',
    description: 'Great form on your last session! Keep it up.',
    timeAgo: '1d ago',
    read: true,
    icon: MessageCircle,
  },
  {
    id: 4,
    type: 'checkin',
    title: 'Weekly Check-in',
    description: 'Time for your weekly progress check-in',
    timeAgo: '2d ago',
    read: true,
    icon: Clock,
  },
];

export default function NotificationCentre({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const todayNotifications = notifications.slice(0, 2);
  const earlierNotifications = notifications.slice(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-grey-1000 z-50 flex items-start justify-center pt-16">
      <div className="w-full max-w-md bg-white border border-grey-100 rounded-b-[16px] shadow-2xl max-h-[calc(100vh-64px)] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-grey-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brazil-green" />
            <h2 className="text-lg font-bold text-black">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-brazil-green text-black text-xs font-bold px-2 py-1 rounded-full ml-2">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-grey-300 transition rounded-lg"
          >
            <X className="w-5 h-5 text-grey-200" />
          </button>
        </div>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <div className="px-6 py-3 border-b border-grey-100">
            <button
              onClick={handleMarkAllRead}
              className="text-brazil-green text-xs font-bold hover:text-brazil-green-dark transition"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications grouped by time */}
        <div className="divide-y divide-white/10">
          {/* TODAY */}
          {todayNotifications.length > 0 && (
            <div>
              <h3 className="px-6 py-3 text-xs font-bold text-grey-200 uppercase tracking-widest bg-grey-300">
                Today
              </h3>
              <div className="divide-y divide-white/5">
                {todayNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`px-6 py-4 flex items-start gap-3 hover:bg-grey-100 transition ${
                      !notif.read ? 'border-l-4 border-brazil-green' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0 pt-1">
                      <p className={`text-sm font-bold ${!notif.read ? 'text-white' : 'text-grey-200'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-grey-200 mt-1 line-clamp-2">{notif.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-[10px] text-gray-500">{notif.timeAgo}</p>
                      <button
                        onClick={() => handleDismiss(notif.id)}
                        className="p-1 hover:bg-grey-300 transition rounded"
                      >
                        <X className="w-3 h-3 text-grey-200" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EARLIER */}
          {earlierNotifications.length > 0 && (
            <div>
              <h3 className="px-6 py-3 text-xs font-bold text-grey-200 uppercase tracking-widest bg-grey-300">
                Earlier
              </h3>
              <div className="divide-y divide-white/5">
                {earlierNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`px-6 py-4 flex items-start gap-3 hover:bg-grey-100 transition ${
                      !notif.read ? 'border-l-4 border-brazil-green' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0 pt-1">
                      <p className={`text-sm font-bold ${!notif.read ? 'text-white' : 'text-grey-200'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-grey-200 mt-1 line-clamp-2">{notif.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-[10px] text-gray-500">{notif.timeAgo}</p>
                      <button
                        onClick={() => handleDismiss(notif.id)}
                        className="p-1 hover:bg-grey-300 transition rounded"
                      >
                        <X className="w-3 h-3 text-grey-200" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notifications.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Bell className="w-8 h-8 text-grey-200 mx-auto mb-3" />
              <p className="text-grey-200 text-sm">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

