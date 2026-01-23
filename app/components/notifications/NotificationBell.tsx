'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalSession } from '../useLocalSession';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedUser?: {
    id: string;
    name: string;
  };
}

export function NotificationBell() {
  const { data: session, status } = useLocalSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const prevStatusRef = useRef(status);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    // Only fetch if user is authenticated
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    try {
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else if (response.status === 401) {
        // User is not authenticated, clear any cached data
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [status, session]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Initial fetch - use setTimeout to avoid synchronous setState
      const timeoutId = setTimeout(() => {
        fetchNotifications();
      }, 0);

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(interval);
      };
    }
  }, [status, session, fetchNotifications]);

  // Separate effect for clearing notifications when user logs out
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (prevStatusRef.current === 'authenticated' && status === 'unauthenticated') {
      setNotifications([]);
      setUnreadCount(0);
    }
    prevStatusRef.current = status;
  }, [status]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Don't render anything if user is not authenticated
  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-md transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black/90 border border-yellow-400/20 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-yellow-400/20">
            <h3 className="font-semibold text-yellow-300">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  setIsOpen(false);
                }}
                className="text-xs text-yellow-300 hover:text-yellow-100"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications yet
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-yellow-400/10 cursor-pointer hover:bg-white/5 ${
                    !notification.read ? 'bg-yellow-400/5' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm text-white">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-2 border-t border-yellow-400/20">
              <button
                onClick={() => {
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
                className="w-full text-xs text-yellow-300 hover:text-yellow-100 py-2"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}