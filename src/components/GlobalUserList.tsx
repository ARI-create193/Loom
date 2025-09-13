import React, { useState, useEffect } from 'react';
import { Users, User, Mail, Calendar, Shield } from 'lucide-react';
import { globalUserDatabase } from '../utils/globalUserDatabase';

const GlobalUserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    onlineUsers: 0,
    newUsersToday: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    // Privacy: Don't load all users, only show stats
    const userStats = globalUserDatabase.getUserStats();
    setUsers([]); // Don't show individual users for privacy
    setStats(userStats);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Website Statistics
          </h3>
          <p className="text-sm text-gray-600">Overview of registered users (privacy protected)</p>
        </div>
        <button
          onClick={loadUsers}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <div className="text-sm text-blue-800">Total Users</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
          <div className="text-sm text-green-800">Active Users</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.onlineUsers}</div>
          <div className="text-sm text-yellow-800">Online Now</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.newUsersToday}</div>
          <div className="text-sm text-purple-800">New Today</div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">Privacy Protected</h4>
        <p className="text-gray-600 mb-4">
          User information is protected for privacy. You can search for specific users when sending invitations.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>How to invite users:</strong> Use the "Invite Member" button above to search for and invite specific users to your teams.
          </p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        User privacy is protected. Individual user data is only accessible through invitation search.
      </div>
    </div>
  );
};

export default GlobalUserList;
