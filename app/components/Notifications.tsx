"use client";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setLoading(false);
      });
  }, []);

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (loading) return <div>Loading notifications...</div>;
  if (notifications.length === 0) return <div>No notifications.</div>;

  return (
    <div>
      <h2 className="font-bold mb-2">Notifications ({unreadCount} unread)</h2>
      <ul>
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`p-2 mb-1 rounded ${n.read ? "bg-gray-100" : "bg-blue-100"}`}
          >
            <div>
              <strong>{n.title}</strong>: {n.message}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
      {unreadCount > 0 && (
        <button
          className="mt-2 text-xs text-blue-700 underline"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      )}
    </div>
  );
}
