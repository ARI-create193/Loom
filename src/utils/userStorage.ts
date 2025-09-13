// Simple password hashing utility
// In production, use a proper library like bcrypt
const hashPassword = (password: string): string => {
  // Simple hash function - in production use bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: string;
  joinDate: string;
  bio?: string;
  skills?: string[];
  isActive: boolean;
}

export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
}

class UserStorage {
  private readonly STORAGE_KEY = 'devhub_users';

  // Initialize storage - start with empty database
  initializeStorage(): void {
    // Start with empty database
    // Users will only be added when they actually register
  }


  // Get all users from storage
  getAllUsers(): StoredUser[] {
    try {
      const usersData = localStorage.getItem(this.STORAGE_KEY);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Save user to storage
  private saveUser(user: StoredUser): void {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  // Save all users to storage
  private saveAllUsers(users: StoredUser[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  // Register a new user
  registerUser(userData: UserRegistrationData): { success: boolean; message: string; user?: StoredUser } {
    const users = this.getAllUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Validate password strength
    if (userData.password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long'
      };
    }

    // Create new user
    const newUser: StoredUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      passwordHash: hashPassword(userData.password),
      avatar: userData.name.charAt(0).toUpperCase(),
      role: 'Developer',
      joinDate: new Date().toISOString(),
      bio: '',
      skills: [],
      isActive: true
    };

    this.saveUser(newUser);
    
    return {
      success: true,
      message: 'User registered successfully',
      user: newUser
    };
  }

  // Authenticate user login
  authenticateUser(email: string, password: string): { success: boolean; message: string; user?: StoredUser } {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.isActive);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    return {
      success: true,
      message: 'Login successful',
      user: user
    };
  }

  // Update user profile
  updateUser(userId: string, updates: Partial<Omit<StoredUser, 'id' | 'email' | 'passwordHash' | 'joinDate'>>): { success: boolean; message: string; user?: StoredUser } {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Update user data
    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveAllUsers(users);
    
    return {
      success: true,
      message: 'Profile updated successfully',
      user: users[userIndex]
    };
  }

  // Change user password
  changePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean; message: string } {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const user = users[userIndex];
    const currentPasswordHash = hashPassword(currentPassword);
    
    if (user.passwordHash !== currentPasswordHash) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters long'
      };
    }

    // Update password
    users[userIndex].passwordHash = hashPassword(newPassword);
    this.saveAllUsers(users);
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  // Get user by ID
  getUserById(userId: string): StoredUser | null {
    const users = this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }

  // Get user by email
  getUserByEmail(email: string): StoredUser | null {
    const users = this.getAllUsers();
    return users.find(u => u.email === email) || null;
  }

  // Delete user (admin function)
  deleteUser(userId: string): { success: boolean; message: string } {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      };
    }


    users.splice(userIndex, 1);
    this.saveAllUsers(users);
    
    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  // Get all users (admin function)
  getAllUsersForAdmin(): StoredUser[] {
    return this.getAllUsers();
  }

  // Clear all users (admin function)
  clearAllUsers(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.DEMO_USER_KEY);
  }
}

// Export singleton instance
export const userStorage = new UserStorage();
