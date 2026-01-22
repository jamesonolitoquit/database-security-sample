'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  gold?: number;
}

interface FriendRequest {
  id: string;
  sender: User;
  createdAt: string;
}

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'following' | 'followers'>('friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchFriends();
      fetchFriendRequests();
      fetchFollowing();
      fetchFollowers();
    }
  }, [status, router]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests');
      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data.friendRequests);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch('/api/follows?type=following');
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch('/api/follows?type=followers');
      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    setActionLoading(requestId);
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Refresh data
        fetchFriendRequests();
        fetchFriends();
        alert(`${action === 'accept' ? 'Friend request accepted!' : 'Friend request rejected'}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    setActionLoading(friendId);
    try {
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });

      if (response.ok) {
        fetchFriends();
        alert('Friend removed');
      } else {
        const error = await response.json();
        alert(error.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFollow = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      });

      if (response.ok) {
        fetchFollowing();
        alert('User followed!');
      } else {
        const error = await response.json();
        alert(error.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error following user:', error);
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/follows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      });

      if (response.ok) {
        fetchFollowing();
        alert('User unfollowed');
      } else {
        const error = await response.json();
        alert(error.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading friends...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Friends & Social
          </h1>
          <p className="text-gray-300">Manage your friendships and follow other adventurers</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-800/50 p-1 rounded-lg">
          {[
            { id: 'friends', label: 'Friends', count: friends.length },
            { id: 'requests', label: 'Requests', count: friendRequests.length },
            { id: 'following', label: 'Following', count: following.length },
            { id: 'followers', label: 'Followers', count: followers.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          {activeTab === 'friends' && (
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">Your Friends</h2>
              {friends.length === 0 ? (
                <p className="text-gray-400">No friends yet. Send some friend requests to get started!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{friend.name}</h3>
                          <p className="text-gray-400 text-sm">{friend.email}</p>
                          <p className="text-yellow-400 text-sm">Level {friend.level} • {friend.xp} XP</p>
                        </div>
                        <button
                          onClick={() => handleUnfriend(friend.id)}
                          disabled={actionLoading === friend.id}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Friend Requests</h2>
              {friendRequests.length === 0 ? (
                <p className="text-gray-400">No pending friend requests.</p>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <div key={request.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{request.sender.name}</h3>
                          <p className="text-gray-400 text-sm">{request.sender.email}</p>
                          <p className="text-yellow-400 text-sm">Level {request.sender.level}</p>
                          <p className="text-gray-500 text-xs">
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFriendRequest(request.id, 'accept')}
                            disabled={actionLoading === request.id}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleFriendRequest(request.id, 'reject')}
                            disabled={actionLoading === request.id}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">Following</h2>
              {following.length === 0 ? (
                <p className="text-gray-400">Not following anyone yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {following.map((user) => (
                    <div key={user.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <p className="text-yellow-400 text-sm">Level {user.level} • {user.xp} XP</p>
                        </div>
                        <button
                          onClick={() => handleUnfollow(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50 text-sm"
                        >
                          Unfollow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div>
              <h2 className="text-2xl font-bold text-orange-400 mb-4">Followers</h2>
              {followers.length === 0 ? (
                <p className="text-gray-400">No followers yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followers.map((user) => (
                    <div key={user.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <p className="text-yellow-400 text-sm">Level {user.level} • {user.xp} XP</p>
                        </div>
                        <div className="flex space-x-2">
                          {!following.some(f => f.id === user.id) && (
                            <button
                              onClick={() => handleFollow(user.id)}
                              disabled={actionLoading === user.id}
                              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
                            >
                              Follow Back
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}