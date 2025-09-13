import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Mail, 
  Trash2, 
  Check, 
  X, 
  Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sharedInvitationService, TeamInvitation, Team } from '../utils/sharedInvitationService';
import { globalUserDatabase } from '../utils/globalUserDatabase';
import GlobalUserList from './GlobalUserList';
import UserSearchForInvitation from './UserSearchForInvitation';

const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  
  // State for invitation system
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'create-team'>('members');
  
  // State for invitations
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [invitationData, setInvitationData] = useState({
    inviteeEmail: '',
    message: ''
  });
  const [selectedUser, setSelectedUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  
  // State for creating team
  const [teamData, setTeamData] = useState({
    name: '',
    description: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize data
  useEffect(() => {
    if (user) {
      loadUserTeams();
      loadInvitations();
      
      // Listen for data changes
      const handleDataChange = () => {
        loadUserTeams();
        loadInvitations();
      };
      
      sharedInvitationService.addEventListener('dataChanged', handleDataChange);
      
      return () => {
        sharedInvitationService.removeEventListener('dataChanged', handleDataChange);
      };
    }
  }, [user]);

  const loadUserTeams = () => {
    if (user) {
      try {
        const userTeams = sharedInvitationService.getUserTeams(user.email);
        setTeams(userTeams || []);
        if (userTeams && userTeams.length > 0 && !currentTeam) {
          setCurrentTeam(userTeams[0]);
        }
      } catch (error) {
        console.error('Error loading user teams:', error);
        setTeams([]);
      }
    }
  };

  const loadInvitations = () => {
    if (user) {
      try {
        const userInvitations = sharedInvitationService.getInvitationsForUser(user.email);
        setInvitations(userInvitations || []);
      } catch (error) {
        console.error('Error loading invitations:', error);
        setInvitations([]);
      }
    }
  };

  const handleUserSelect = (user: { name: string; email: string; avatar: string }) => {
    setSelectedUser(user);
    setInvitationData({ ...invitationData, inviteeEmail: user.email });
  };

  const handleCreateTeam = () => {
    if (!teamData.name.trim()) {
      setError('Team name is required');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const result = sharedInvitationService.createTeam({
        name: teamData.name,
        description: teamData.description,
        ownerId: user.email
      });

      if (result.success && result.team) {
        setSuccess('Team created successfully!');
        setTeamData({ name: '', description: '' });
        setActiveTab('members');
        loadUserTeams();
        setCurrentTeam(result.team);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team. Please try again.');
    }
  };

  const handleSendInvitation = () => {
    if (!invitationData.inviteeEmail.trim()) {
      setError('Please select a user to invite');
      return;
    }

    if (!currentTeam || !user) {
      setError('No team selected or user not authenticated');
      return;
    }

    const result = sharedInvitationService.sendInvitation({
      teamId: currentTeam.id,
      teamName: currentTeam.name,
      inviterId: user.email,
      inviterName: user.name,
      inviteeEmail: invitationData.inviteeEmail,
      message: invitationData.message
    });

    if (result.success) {
      setSuccess('Invitation sent successfully!');
      setInvitationData({ inviteeEmail: '', message: '' });
      setSelectedUser(null);
      setIsSendingInvitation(false);
      loadInvitations();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
    }
  };

  const handleInvitationResponse = (invitationId: string, response: 'accepted' | 'declined') => {
    if (!user) return;

    const result = sharedInvitationService.respondToInvitation(invitationId, user.email, response);
    
    if (result.success) {
      setSuccess(`Invitation ${response} successfully!`);
      loadInvitations();
      loadUserTeams();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
    }
  };


  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-3 text-blue-500" />
              Team Management
            </h1>
            <p className="text-gray-600 mt-1">
              {currentTeam ? `${currentTeam.name} • ${currentTeam.members.length} members` : 'No team selected'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('create-team')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Team</span>
            </button>
            <button
              onClick={() => setIsSendingInvitation(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={!currentTeam}
            >
              <Send className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>
        </div>

        {/* Team Selector */}
        {teams.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Team:</label>
            <select
              value={currentTeam?.id || ''}
              onChange={(e) => {
                const selectedTeam = teams.find(t => t.id === e.target.value);
                setCurrentTeam(selectedTeam || null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-6 flex space-x-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invitations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Invitations ({invitations.filter(inv => inv.status === 'pending').length})
          </button>
        </div>
      </div>

      <div className="flex-1 p-6">
        {/* Global Users List */}
        <GlobalUserList />

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Team Modal */}
        {activeTab === 'create-team' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamData.name}
                  onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={teamData.description}
                  onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter team description"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setActiveTab('members')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Create Team
              </button>
            </div>
          </div>
        )}

        {/* Send Invitation Modal */}
        {isSendingInvitation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Team Invitation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
                  <UserSearchForInvitation
                    onUserSelect={handleUserSelect}
                    placeholder="Search users by name or email..."
                  />
                  
                  {/* Selected User Display */}
                  {selectedUser && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {selectedUser.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{selectedUser.name}</div>
                          <div className="text-sm text-gray-500">{selectedUser.email}</div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedUser(null);
                            setInvitationData({ ...invitationData, inviteeEmail: '' });
                          }}
                          className="ml-auto p-1 hover:bg-blue-100 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                  <textarea
                    value={invitationData.message}
                    onChange={(e) => setInvitationData({ ...invitationData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a personal message"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsSendingInvitation(false);
                    setInvitationData({ inviteeEmail: '', message: '' });
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvitation}
                  disabled={!selectedUser}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'members' && (
          <div>
            {!currentTeam ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Selected</h3>
                <p className="text-gray-600 mb-6">Create a team or select an existing one to manage members</p>
                <button
                  onClick={() => setActiveTab('create-team')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Team</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentTeam.name}</h3>
                  <p className="text-gray-600 mb-4">{currentTeam.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{currentTeam.members.length} members</span>
                    <span>Created {new Date(currentTeam.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Team Members */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentTeam.members.map((memberEmail) => {
                    const member = globalUserDatabase.getUserByEmail(memberEmail);
                    if (!member) return null;
                    
                    return (
                      <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-lg">{member.avatar}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{member.name}</h3>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                          </div>
                          {currentTeam.ownerId === user?.email && memberEmail !== user.email && (
                            <button
                              onClick={() => {
                                if (window.confirm('Remove this member from the team?')) {
                                  const result = sharedInvitationService.removeMemberFromTeam(currentTeam.id, memberEmail, user.email);
                                  if (result.success) {
                                    setSuccess('Member removed successfully');
                                    loadUserTeams();
                                    setTimeout(() => setSuccess(''), 3000);
                                  } else {
                                    setError(result.message);
                                  }
                                }
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Role</span>
                            <span className="text-sm font-medium text-gray-900">{member.role}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Joined</span>
                            <span className="text-sm text-gray-900">
                              {new Date(member.joinDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div>
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invitations</h3>
                <p className="text-gray-600">You haven't received any team invitations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Team Invitation</h3>
                            <p className="text-sm text-gray-500">From {invitation.inviterName}</p>
                          </div>
                        </div>
                        
                        <div className="ml-13">
                          <p className="text-lg font-medium text-gray-900 mb-1">{invitation.teamName}</p>
                          {invitation.message && (
                            <p className="text-gray-600 mb-3">"{invitation.message}"</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Sent {new Date(invitation.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invitation.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : invitation.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {invitation.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {invitation.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleInvitationResponse(invitation.id, 'declined')}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TeamManagement;
