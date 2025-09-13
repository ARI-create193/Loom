// Simulated shared invitation service that works across all browser instances
// In a real app, this would be a backend API

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
  message?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[]; // Array of user emails
  createdAt: string;
  isActive: boolean;
}

// Global shared data (simulates server database)
class SharedInvitationService {
  private static instance: SharedInvitationService;
  private invitations: TeamInvitation[] = [];
  private teams: Team[] = [];
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.loadFromStorage();
    this.setupStorageListener();
  }

  static getInstance(): SharedInvitationService {
    if (!SharedInvitationService.instance) {
      SharedInvitationService.instance = new SharedInvitationService();
    }
    return SharedInvitationService.instance;
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    try {
      const invitationsData = localStorage.getItem('devhub_shared_invitations');
      const teamsData = localStorage.getItem('devhub_shared_teams');
      
      if (invitationsData) {
        this.invitations = JSON.parse(invitationsData);
      }
      if (teamsData) {
        this.teams = JSON.parse(teamsData);
      }
    } catch (error) {
      console.error('Error loading shared data:', error);
      this.invitations = [];
      this.teams = [];
    }
  }

  // Save data to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('devhub_shared_invitations', JSON.stringify(this.invitations));
      localStorage.setItem('devhub_shared_teams', JSON.stringify(this.teams));
    } catch (error) {
      console.error('Error saving shared data:', error);
    }
  }

  // Listen for storage changes (for cross-tab communication)
  private setupStorageListener(): void {
    window.addEventListener('storage', (e) => {
      if (e.key === 'devhub_shared_invitations' || e.key === 'devhub_shared_teams') {
        this.loadFromStorage();
        this.notifyListeners('dataChanged');
      }
    });
  }

  // Add event listener
  addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Remove event listener
  removeEventListener(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners
  private notifyListeners(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  // Create a new team
  createTeam(teamData: { name: string; description: string; ownerId: string }): { success: boolean; message: string; team?: Team } {
    // Check if team name already exists
    if (this.teams.find(t => t.name === teamData.name)) {
      return {
        success: false,
        message: 'Team name already exists'
      };
    }

    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: teamData.name,
      description: teamData.description,
      ownerId: teamData.ownerId,
      members: [teamData.ownerId], // Owner is automatically a member
      createdAt: new Date().toISOString(),
      isActive: true
    };

    this.teams.push(newTeam);
    this.saveToStorage();
    this.notifyListeners('dataChanged');

    return {
      success: true,
      message: 'Team created successfully',
      team: newTeam
    };
  }

  // Send team invitation
  sendInvitation(invitationData: {
    teamId: string;
    teamName: string;
    inviterId: string;
    inviterName: string;
    inviteeEmail: string;
    message?: string;
  }): { success: boolean; message: string; invitation?: TeamInvitation } {
    // Find the team
    const team = this.teams.find(t => t.id === invitationData.teamId);
    if (!team) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    // Check if user is already a member
    if (team.members.includes(invitationData.inviteeEmail)) {
      return {
        success: false,
        message: 'User is already a member of this team'
      };
    }

    // Check if there's already a pending invitation
    const existingInvitation = this.invitations.find(
      inv => inv.teamId === invitationData.teamId && 
             inv.inviteeEmail === invitationData.inviteeEmail && 
             inv.status === 'pending'
    );

    if (existingInvitation) {
      return {
        success: false,
        message: 'Invitation already sent to this user'
      };
    }

    // Create new invitation
    const newInvitation: TeamInvitation = {
      id: `invitation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId: invitationData.teamId,
      teamName: invitationData.teamName,
      inviterId: invitationData.inviterId,
      inviterName: invitationData.inviterName,
      inviteeId: '', // Will be filled when user accepts
      inviteeEmail: invitationData.inviteeEmail,
      status: 'pending',
      createdAt: new Date().toISOString(),
      message: invitationData.message
    };

    this.invitations.push(newInvitation);
    this.saveToStorage();
    this.notifyListeners('dataChanged');

    return {
      success: true,
      message: 'Invitation sent successfully',
      invitation: newInvitation
    };
  }

  // Get all invitations
  getAllInvitations(): TeamInvitation[] {
    return this.invitations;
  }

  // Get invitations for a specific user (by email)
  getInvitationsForUser(userEmail: string): TeamInvitation[] {
    return this.invitations.filter(inv => inv.inviteeEmail === userEmail);
  }

  // Get invitations sent by a user
  getInvitationsSentByUser(userId: string): TeamInvitation[] {
    return this.invitations.filter(inv => inv.inviterId === userId);
  }

  // Respond to invitation (accept/decline)
  respondToInvitation(invitationId: string, userEmail: string, response: 'accepted' | 'declined'): { success: boolean; message: string } {
    const invitationIndex = this.invitations.findIndex(inv => inv.id === invitationId);
    if (invitationIndex === -1) {
      return {
        success: false,
        message: 'Invitation not found'
      };
    }

    const invitation = this.invitations[invitationIndex];
    
    // Verify the user is the intended recipient
    if (invitation.inviteeEmail !== userEmail) {
      return {
        success: false,
        message: 'You are not authorized to respond to this invitation'
      };
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return {
        success: false,
        message: 'Invitation has already been responded to'
      };
    }

    // Update invitation status
    this.invitations[invitationIndex].status = response;
    this.invitations[invitationIndex].respondedAt = new Date().toISOString();

    // If accepted, add user to team
    if (response === 'accepted') {
      const teamIndex = this.teams.findIndex(t => t.id === invitation.teamId);
      if (teamIndex !== -1) {
        // Add user email to team members
        if (!this.teams[teamIndex].members.includes(userEmail)) {
          this.teams[teamIndex].members.push(userEmail);
        }
      }
    }

    this.saveToStorage();
    this.notifyListeners('dataChanged');

    return {
      success: true,
      message: `Invitation ${response} successfully`
    };
  }

  // Get all teams
  getAllTeams(): Team[] {
    return this.teams;
  }

  // Get teams for a user
  getUserTeams(userEmail: string): Team[] {
    return this.teams.filter(team => team.members.includes(userEmail));
  }

  // Get team by ID
  getTeamById(teamId: string): Team | null {
    return this.teams.find(t => t.id === teamId) || null;
  }

  // Remove member from team
  removeMemberFromTeam(teamId: string, userEmail: string, requesterId: string): { success: boolean; message: string } {
    const teamIndex = this.teams.findIndex(t => t.id === teamId);
    
    if (teamIndex === -1) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    const team = this.teams[teamIndex];
    
    // Only team owner can remove members
    if (team.ownerId !== requesterId) {
      return {
        success: false,
        message: 'Only team owner can remove members'
      };
    }

    // Can't remove the owner
    if (team.ownerId === userEmail) {
      return {
        success: false,
        message: 'Cannot remove team owner'
      };
    }

    // Remove member
    this.teams[teamIndex].members = this.teams[teamIndex].members.filter(member => member !== userEmail);
    this.saveToStorage();
    this.notifyListeners('dataChanged');

    return {
      success: true,
      message: 'Member removed successfully'
    };
  }

  // Delete team
  deleteTeam(teamId: string, requesterId: string): { success: boolean; message: string } {
    const teamIndex = this.teams.findIndex(t => t.id === teamId);
    
    if (teamIndex === -1) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    const team = this.teams[teamIndex];
    
    // Only team owner can delete team
    if (team.ownerId !== requesterId) {
      return {
        success: false,
        message: 'Only team owner can delete team'
      };
    }

    // Remove team
    this.teams.splice(teamIndex, 1);
    
    // Remove all related invitations
    this.invitations = this.invitations.filter(inv => inv.teamId !== teamId);
    
    this.saveToStorage();
    this.notifyListeners('dataChanged');

    return {
      success: true,
      message: 'Team deleted successfully'
    };
  }

  // Clear all data (admin function)
  clearAllData(): void {
    this.invitations = [];
    this.teams = [];
    this.saveToStorage();
    this.notifyListeners('dataChanged');
  }
}

// Export singleton instance
export const sharedInvitationService = SharedInvitationService.getInstance();
