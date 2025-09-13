import React, { useState, useEffect } from 'react';
import { sharedInvitationService } from '../utils/sharedInvitationService';
import { userStorage } from '../utils/userStorage';

const InvitationTest: React.FC = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    
    // Listen for changes
    const handleDataChange = () => {
      loadData();
    };
    
    sharedInvitationService.addEventListener('dataChanged', handleDataChange);
    
    return () => {
      sharedInvitationService.removeEventListener('dataChanged', handleDataChange);
    };
  }, []);

  const loadData = () => {
    try {
      setInvitations(sharedInvitationService.getAllInvitations() || []);
      setTeams(sharedInvitationService.getAllTeams() || []);
      setUsers(userStorage.getAllUsers() || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setInvitations([]);
      setTeams([]);
      setUsers([]);
    }
  };

  const clearAllData = () => {
    if (window.confirm('Clear all invitation and team data?')) {
      sharedInvitationService.clearAllData();
      loadData();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Invitation System Debug</h3>
        <button
          onClick={clearAllData}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Clear All Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">Users ({users.length})</h4>
          <div className="mt-2 space-y-1">
            {users.map(user => (
              <div key={user.id} className="text-sm text-blue-700">
                {user.name} ({user.email})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900">Teams ({teams.length})</h4>
          <div className="mt-2 space-y-1">
            {teams.map(team => (
              <div key={team.id} className="text-sm text-green-700">
                {team.name} ({team.members.length} members)
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900">Invitations ({invitations.length})</h4>
          <div className="mt-2 space-y-1">
            {invitations.map(inv => (
              <div key={inv.id} className="text-sm text-yellow-700">
                {inv.teamName} → {inv.inviteeEmail} ({inv.status})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        This debug panel shows all shared data across all users. 
        Data should update automatically when invitations are sent/received.
      </div>
    </div>
  );
};

export default InvitationTest;
