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
    const allUsers = globalUserDatabase.getAllActiveUsers();
    const userStats = globalUserDatabase.getUserStats();
    setUsers(allUsers);
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
            Website Users
          </h3>
          <p className="text-sm text-gray-600">All registered users on your website</p>
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

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Users Yet</h4>
          <p className="text-gray-600">Users will appear here when they register on your website</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{user.avatar}</span>
                  </div>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {user.email}
                    </span>
                    <span className="flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Joined {formatDate(user.joinDate)}
                    </span>
                  </div>
                </div>
              </div>
              {user.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {user.skills.slice(0, 3).map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {user.skills.length > 3 && (
                    <span className="text-xs text-gray-500">+{user.skills.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        This shows all users who have registered on your website. Only real registered users appear here.
      </div>
    </div>
  );
};

export default GlobalUserList;
