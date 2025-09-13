import React, { createContext, useContext, useState, useEffect } from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  joinDate: string;
  isVideoOn?: boolean;
  isMuted?: boolean;
}

interface TeamContextType {
  teamMembers: TeamMember[];
  addTeamMember: (name: string, email: string, role: string) => boolean;
  removeTeamMember: (id: string) => void;
  updateMemberStatus: (id: string, status: 'online' | 'away' | 'offline') => void;
  updateMemberVideoStatus: (id: string, isVideoOn: boolean, isMuted: boolean) => void;
  getOnlineMembers: () => TeamMember[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Load team members from localStorage on mount
  useEffect(() => {
    const savedMembers = localStorage.getItem('teamMembers');
    if (savedMembers) {
      setTeamMembers(JSON.parse(savedMembers));
    }
  }, []);

  // Save team members to localStorage whenever team changes
  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    // Trigger custom event to notify other tabs
    window.dispatchEvent(new CustomEvent('teamMembersUpdated', { 
      detail: teamMembers 
    }));
  }, [teamMembers]);

  // Listen for team updates from other tabs
  useEffect(() => {
    const handleTeamUpdate = (event: CustomEvent) => {
      setTeamMembers(event.detail);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'teamMembers' && event.newValue) {
        setTeamMembers(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('teamMembersUpdated', handleTeamUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('teamMembersUpdated', handleTeamUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addTeamMember = (name: string, email: string, role: string): boolean => {
    // Check if email already exists
    if (teamMembers.find(member => member.email === email)) {
      return false; // Email already exists
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name,
      email,
      avatar: name.charAt(0).toUpperCase(),
      role,
      status: 'offline',
      joinDate: new Date().toISOString(),
      isVideoOn: false,
      isMuted: false
    };

    setTeamMembers(prev => [...prev, newMember]);
    return true;
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };

  const updateMemberStatus = (id: string, status: 'online' | 'away' | 'offline') => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, status } : member
      )
    );
  };

  const updateMemberVideoStatus = (id: string, isVideoOn: boolean, isMuted: boolean) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, isVideoOn, isMuted } : member
      )
    );
  };

  const getOnlineMembers = () => {
    return teamMembers.filter(member => member.status === 'online');
  };

  const value: TeamContextType = {
    teamMembers,
    addTeamMember,
    removeTeamMember,
    updateMemberStatus,
    updateMemberVideoStatus,
    getOnlineMembers
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};
