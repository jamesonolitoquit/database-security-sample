'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  level: number;
  xp: number;
  gold: number;
  createdAt: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalReports: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchUsers();
      fetchStats();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      if (response.ok) {
        alert(`${action} successful`);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Access denied. Admin privileges required.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-300">Manage users, monitor system activity, and maintain the platform.</p>
        </div>

        {/* System Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Active Users</h3>
              <p className="text-3xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Total Posts</h3>
              <p className="text-3xl font-bold">{stats.totalPosts}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Reports</h3>
              <p className="text-3xl font-bold">{stats.totalReports}</p>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-yellow-400">User Management</h2>
            <p className="text-gray-300 mt-1">Monitor and manage user accounts</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        Lv.{user.level} ({user.xp} XP)
                      </div>
                      <div className="text-sm text-yellow-400">{user.gold} Gold</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleUserAction(user.id, 'promote')}
                            disabled={actionLoading === user.id}
                            className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                          >
                            Promote
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            disabled={actionLoading === user.id}
                            className="text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'ban')}
                            disabled={actionLoading === user.id}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            Ban
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}