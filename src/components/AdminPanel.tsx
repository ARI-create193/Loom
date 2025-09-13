import React, { useState } from 'react';
import { globalUserDatabase } from '../utils/globalUserDatabase';

const AdminPanel: React.FC = () => {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Developer',
    bio: '',
    skills: ''
  });
  const [message, setMessage] = useState('');

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      setMessage('Name and email are required');
      return;
    }

    const skills = newUser.skills.split(',').map(s => s.trim()).filter(s => s);
    
    const result = globalUserDatabase.addUserManually({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      bio: newUser.bio,
      skills: skills
    });

    if (result.success) {
      setMessage('User added successfully!');
      setNewUser({
        name: '',
        email: '',
        role: 'Developer',
        bio: '',
        skills: ''
      });
    } else {
      setMessage(result.message);
    }
  };

  const addTestUsers = () => {
    const testUsers = [
      { name: 'Alice Johnson', email: 'alice@example.com', role: 'Designer', skills: 'Figma,UI,UX' },
      { name: 'Bob Wilson', email: 'bob@example.com', role: 'Developer', skills: 'JavaScript,React,Node.js' },
      { name: 'Carol Davis', email: 'carol@example.com', role: 'Manager', skills: 'Project Management,Leadership' }
    ];

    testUsers.forEach(user => {
      const skills = user.skills.split(',').map(s => s.trim());
      globalUserDatabase.addUserManually({
        name: user.name,
        email: user.email,
        role: user.role,
        skills: skills
      });
    });

    setMessage('Test users added successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Panel - Add Users</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter user name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter user email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
            <option value="Tester">Tester</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Optional)</label>
          <input
            type="text"
            value={newUser.bio}
            onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter user bio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
          <input
            type="text"
            value={newUser.skills}
            onChange={(e) => setNewUser({ ...newUser, skills: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="React, Node.js, TypeScript"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add User
          </button>
          <button
            onClick={addTestUsers}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Add Test Users
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
