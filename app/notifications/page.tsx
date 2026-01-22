'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Check, CheckCheck } from 'lucide-react';

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

export default function NotificationsPage() {
  const { status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch notifications
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = unreadOnly
        ? '/api/notifications?unreadOnly=true'
        : '/api/notifications';
      const response = await fetch(url);
      if (response.status === 401) {
        // User is not authenticated, clear notifications
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (status !== 'authenticated') return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });
      if (response.status === 401) {
        // User is not authenticated, refresh the page or redirect
        return;
      }
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
    if (status !== 'authenticated') return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      if (response.status === 401) {
        // User is not authenticated, refresh the page or redirect
        return;
      }
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications(activeTab === 'unread');
    } else if (status === 'unauthenticated') {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [status, activeTab, fetchNotifications]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👥';
      case 'friend_request':
        return '🤝';
      case 'friend_accepted':
        return '🎉';
      default:
        return '🔔';
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-8 text-gray-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-8">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">Please sign in to view your notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-yellow-300" />
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-300">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex space-x-1 bg-black/40 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors relative ${
              activeTab === 'unread'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-black/40 border border-yellow-400/20 rounded-lg p-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No {activeTab === 'unread' ? 'unread ' : ''}notifications
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  !notification.read ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-black/20 border-yellow-400/10'
                }`}
              >
                <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 text-yellow-300 hover:text-yellow-100 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}