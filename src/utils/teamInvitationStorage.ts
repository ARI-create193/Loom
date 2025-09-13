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
  members: string[]; // Array of user IDs
  createdAt: string;
  isActive: boolean;
}

class TeamInvitationStorage {
  private readonly INVITATIONS_KEY = 'devhub_team_invitations';
  private readonly TEAMS_KEY = 'devhub_teams';
  private readonly SHARED_STORAGE_KEY = 'devhub_shared_data';

  // Initialize storage
  initializeStorage(): void {
    // Initialize local storage
    if (!localStorage.getItem(this.INVITATIONS_KEY)) {
      localStorage.setItem(this.INVITATIONS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.TEAMS_KEY)) {
      localStorage.setItem(this.TEAMS_KEY, JSON.stringify([]));
    }

    // Initialize shared storage (simulates server-side storage)
    this.initializeSharedStorage();
  }

  // Initialize shared storage that works across all users
  private initializeSharedStorage(): void {
    const sharedData = this.getSharedData();
    
    if (!sharedData.invitations) {
      sharedData.invitations = [];
    }
    if (!sharedData.teams) {
      sharedData.teams = [];
    }
    
    this.saveSharedData(sharedData);
  }

  // Get shared data (simulates database)
  private getSharedData(): { invitations: TeamInvitation[], teams: Team[] } {
    try {
      const data = localStorage.getItem(this.SHARED_STORAGE_KEY);
      return data ? JSON.parse(data) : { invitations: [], teams: [] };
    } catch (error) {
      console.error('Error loading shared data:', error);
      return { invitations: [], teams: [] };
    }
  }

  // Save shared data (simulates database)
  private saveSharedData(data: { invitations: TeamInvitation[], teams: Team[] }): void {
    localStorage.setItem(this.SHARED_STORAGE_KEY, JSON.stringify(data));
  }

  // Get all invitations (from shared storage)
  getAllInvitations(): TeamInvitation[] {
    const sharedData = this.getSharedData();
    return sharedData.invitations;
  }

  // Get all teams (from shared storage)
  getAllTeams(): Team[] {
    const sharedData = this.getSharedData();
    return sharedData.teams;
  }

  // Save invitations (to shared storage)
  private saveInvitations(invitations: TeamInvitation[]): void {
    const sharedData = this.getSharedData();
    sharedData.invitations = invitations;
    this.saveSharedData(sharedData);
  }

  // Save teams (to shared storage)
  private saveTeams(teams: Team[]): void {
    const sharedData = this.getSharedData();
    sharedData.teams = teams;
    this.saveSharedData(sharedData);
  }

  // Create a new team
  createTeam(teamData: { name: string; description: string; ownerId: string }): { success: boolean; message: string; team?: Team } {
    const teams = this.getAllTeams();
    
    // Check if team name already exists
    if (teams.find(t => t.name === teamData.name)) {
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

    teams.push(newTeam);
    this.saveTeams(teams);

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
    const invitations = this.getAllInvitations();
    const teams = this.getAllTeams();
    
    // Find the team
    const team = teams.find(t => t.id === invitationData.teamId);
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
    const existingInvitation = invitations.find(
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

    invitations.push(newInvitation);
    this.saveInvitations(invitations);

    return {
      success: true,
      message: 'Invitation sent successfully',
      invitation: newInvitation
    };
  }

  // Get invitations for a specific user (by email)
  getInvitationsForUser(userEmail: string): TeamInvitation[] {
    const invitations = this.getAllInvitations();
    return invitations.filter(inv => inv.inviteeEmail === userEmail);
  }

  // Get invitations sent by a user
  getInvitationsSentByUser(userId: string): TeamInvitation[] {
    const invitations = this.getAllInvitations();
    return invitations.filter(inv => inv.inviterId === userId);
  }

  // Respond to invitation (accept/decline)
  respondToInvitation(invitationId: string, userEmail: string, response: 'accepted' | 'declined'): { success: boolean; message: string } {
    const invitations = this.getAllInvitations();
    const teams = this.getAllTeams();
    
    const invitationIndex = invitations.findIndex(inv => inv.id === invitationId);
    if (invitationIndex === -1) {
      return {
        success: false,
        message: 'Invitation not found'
      };
    }

    const invitation = invitations[invitationIndex];
    
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
    invitations[invitationIndex].status = response;
    invitations[invitationIndex].respondedAt = new Date().toISOString();

    // If accepted, add user to team
    if (response === 'accepted') {
      const teamIndex = teams.findIndex(t => t.id === invitation.teamId);
      if (teamIndex !== -1) {
        // Add user email to team members (we'll use email as identifier for now)
        if (!teams[teamIndex].members.includes(userEmail)) {
          teams[teamIndex].members.push(userEmail);
          this.saveTeams(teams);
        }
      }
    }

    this.saveInvitations(invitations);

    return {
      success: true,
      message: `Invitation ${response} successfully`
    };
  }

  // Get team members
  getTeamMembers(teamId: string): string[] {
    const teams = this.getAllTeams();
    const team = teams.find(t => t.id === teamId);
    return team ? team.members : [];
  }

  // Remove member from team
  removeMemberFromTeam(teamId: string, userEmail: string, requesterId: string): { success: boolean; message: string } {
    const teams = this.getAllTeams();
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex === -1) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    const team = teams[teamIndex];
    
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
    teams[teamIndex].members = teams[teamIndex].members.filter(member => member !== userEmail);
    this.saveTeams(teams);

    return {
      success: true,
      message: 'Member removed successfully'
    };
  }

  // Get teams for a user
  getUserTeams(userEmail: string): Team[] {
    const teams = this.getAllTeams();
    return teams.filter(team => team.members.includes(userEmail));
  }

  // Delete team
  deleteTeam(teamId: string, requesterId: string): { success: boolean; message: string } {
    const teams = this.getAllTeams();
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex === -1) {
      return {
        success: false,
        message: 'Team not found'
      };
    }

    const team = teams[teamIndex];
    
    // Only team owner can delete team
    if (team.ownerId !== requesterId) {
      return {
        success: false,
        message: 'Only team owner can delete team'
      };
    }

    // Remove team
    teams.splice(teamIndex, 1);
    this.saveTeams(teams);

    // Remove all related invitations
    const invitations = this.getAllInvitations();
    const updatedInvitations = invitations.filter(inv => inv.teamId !== teamId);
    this.saveInvitations(updatedInvitations);

    return {
      success: true,
      message: 'Team deleted successfully'
    };
  }

  // Clear all data (admin function)
  clearAllData(): void {
    localStorage.removeItem(this.INVITATIONS_KEY);
    localStorage.removeItem(this.TEAMS_KEY);
    localStorage.removeItem(this.SHARED_STORAGE_KEY);
  }
}

// Export singleton instance
export const teamInvitationStorage = new TeamInvitationStorage();
