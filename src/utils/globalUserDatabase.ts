// Global user database that simulates a real website's user system
// All users registered on the website are stored here

export interface GlobalUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinDate: string;
  bio?: string;
  skills?: string[];
  isActive: boolean;
  isOnline: boolean;
  lastSeen: string;
}

class GlobalUserDatabase {
  private static instance: GlobalUserDatabase;
  private users: GlobalUser[] = [];
  private readonly STORAGE_KEY = 'devhub_global_users';

  private constructor() {
    this.loadUsers();
    this.initializeDefaultUsers();
  }

  static getInstance(): GlobalUserDatabase {
    if (!GlobalUserDatabase.instance) {
      GlobalUserDatabase.instance = new GlobalUserDatabase();
    }
    return GlobalUserDatabase.instance;
  }

  // Load users from localStorage
  private loadUsers(): void {
    try {
      const usersData = localStorage.getItem(this.STORAGE_KEY);
      if (usersData) {
        this.users = JSON.parse(usersData);
      }
    } catch (error) {
      console.error('Error loading global users:', error);
      this.users = [];
    }
  }

  // Save users to localStorage
  private saveUsers(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving global users:', error);
    }
  }

  // Initialize with some test users for demonstration
  private initializeDefaultUsers(): void {
    // Add some test users for demonstration purposes
    const testUsers: GlobalUser[] = [
      {
        id: 'user-test-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'J',
        role: 'Developer',
        joinDate: new Date().toISOString(),
        bio: 'Full-stack developer',
        skills: ['React', 'Node.js', 'TypeScript'],
        isActive: true,
        isOnline: false,
        lastSeen: new Date().toISOString()
      },
      {
        id: 'user-test-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        avatar: 'J',
        role: 'Designer',
        joinDate: new Date().toISOString(),
        bio: 'UI/UX Designer',
        skills: ['Figma', 'Photoshop', 'CSS'],
        isActive: true,
        isOnline: false,
        lastSeen: new Date().toISOString()
      },
      {
        id: 'user-test-3',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        avatar: 'M',
        role: 'Developer',
        joinDate: new Date().toISOString(),
        bio: 'Backend developer',
        skills: ['Python', 'Django', 'PostgreSQL'],
        isActive: true,
        isOnline: false,
        lastSeen: new Date().toISOString()
      }
    ];

    // Only add test users if no users exist
    if (this.users.length === 0) {
      this.users = testUsers;
      this.saveUsers();
    }
  }

  // Register a new user (when they sign up)
  registerUser(userData: {
    name: string;
    email: string;
    password: string;
  }): { success: boolean; message: string; user?: GlobalUser } {
    // Check if user already exists
    if (this.users.find(u => u.email === userData.email)) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Create new user
    const newUser: GlobalUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      avatar: userData.name.charAt(0).toUpperCase(),
      role: 'Developer',
      joinDate: new Date().toISOString(),
      bio: '',
      skills: [],
      isActive: true,
      isOnline: true,
      lastSeen: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();

    return {
      success: true,
      message: 'User registered successfully',
      user: newUser
    };
  }

  // Sync existing users from userStorage (for migration)
  syncExistingUsers(existingUsers: any[]): void {
    existingUsers.forEach(user => {
      // Only add if not already in global database
      if (!this.users.find(u => u.email === user.email)) {
        const globalUser: GlobalUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          joinDate: user.joinDate,
          bio: user.bio || '',
          skills: user.skills || [],
          isActive: user.isActive !== false,
          isOnline: false,
          lastSeen: new Date().toISOString()
        };
        this.users.push(globalUser);
      }
    });
    this.saveUsers();
  }

  // Search users by name or email (for invitations only)
  // Users can only search for other users to send invitations, not browse all users
  searchUsersForInvitation(query: string, currentUserEmail: string): GlobalUser[] {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    return this.users.filter(user => 
      user.isActive && 
      user.email !== currentUserEmail && // Don't show current user
      (
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm) ||
        (user.skills && user.skills.some(skill => skill.toLowerCase().includes(searchTerm)))
      )
    ).slice(0, 10); // Limit results to 10 for privacy
  }

  // Check if a user exists by email (for invitation validation)
  checkUserExists(email: string): boolean {
    return this.users.some(user => user.email === email && user.isActive);
  }

  // Get user info for invitation (minimal data)
  getUserForInvitation(email: string): { name: string; email: string; avatar: string } | null {
    const user = this.users.find(u => u.email === email && u.isActive);
    if (!user) return null;
    
    return {
      name: user.name,
      email: user.email,
      avatar: user.avatar
    };
  }

  // Get user by email
  getUserByEmail(email: string): GlobalUser | null {
    return this.users.find(u => u.email === email) || null;
  }

  // Get user by ID
  getUserById(id: string): GlobalUser | null {
    return this.users.find(u => u.id === id) || null;
  }


  // Get online users count (privacy-focused - only returns count, not user data)
  getOnlineUsersCount(): number {
    return this.users.filter(u => u.isActive && u.isOnline).length;
  }

  // Update user online status
  updateUserOnlineStatus(email: string, isOnline: boolean): void {
    const userIndex = this.users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      this.users[userIndex].isOnline = isOnline;
      this.users[userIndex].lastSeen = new Date().toISOString();
      this.saveUsers();
    }
  }

  // Update user profile
  updateUserProfile(email: string, updates: Partial<Omit<GlobalUser, 'id' | 'email' | 'joinDate'>>): { success: boolean; message: string } {
    const userIndex = this.users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveUsers();

    return {
      success: true,
      message: 'Profile updated successfully'
    };
  }


  // Get user statistics
  getUserStats(): {
    totalUsers: number;
    activeUsers: number;
    onlineUsers: number;
    newUsersToday: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = this.users.filter(user => 
      new Date(user.joinDate) >= today
    ).length;

    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.isActive).length,
      onlineUsers: this.users.filter(u => u.isActive && u.isOnline).length,
      newUsersToday
    };
  }

  // Add user manually (for testing/admin purposes)
  addUserManually(userData: {
    name: string;
    email: string;
    role?: string;
    bio?: string;
    skills?: string[];
  }): { success: boolean; message: string; user?: GlobalUser } {
    // Check if user already exists
    if (this.users.find(u => u.email === userData.email)) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Create new user
    const newUser: GlobalUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      avatar: userData.name.charAt(0).toUpperCase(),
      role: userData.role || 'Developer',
      joinDate: new Date().toISOString(),
      bio: userData.bio || '',
      skills: userData.skills || [],
      isActive: true,
      isOnline: false,
      lastSeen: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();

    return {
      success: true,
      message: 'User added successfully',
      user: newUser
    };
  }

  // Clear all users (admin function)
  clearAllUsers(): void {
    this.users = [];
    this.saveUsers();
  }
}

// Export singleton instance
export const globalUserDatabase = GlobalUserDatabase.getInstance();
