import React, { createContext, useContext, useState, useEffect } from 'react';
import { userStorage } from '../utils/userStorage';
import { globalUserDatabase } from '../utils/globalUserDatabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinDate: string;
  bio?: string;
  skills?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  loading: boolean;
  sessionExpired: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const checkUserSession = () => {
      // Initialize user storage
      userStorage.initializeStorage();
      
      // Initialize global user database and sync existing users
      globalUserDatabase;
      
      // Sync any existing users from userStorage to global database
      const existingUsers = userStorage.getAllUsers();
      if (existingUsers.length > 0) {
        globalUserDatabase.syncExistingUsers(existingUsers);
      }
      
      const savedUser = localStorage.getItem('user');
      const sessionData = localStorage.getItem('session');
      
      // Ensure current user is in global database if they exist
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        const globalUser = globalUserDatabase.getUserByEmail(userData.email);
        if (!globalUser) {
          // Add current user to global database if not present
          const userFromStorage = userStorage.getUserByEmail(userData.email);
          if (userFromStorage) {
            globalUserDatabase.syncExistingUsers([userFromStorage]);
          }
        }
      }
      
      if (savedUser && sessionData) {
        const session = JSON.parse(sessionData);
        const now = new Date().getTime();
        
        // Check if session is expired (24 hours for remember me, 8 hours for regular session)
        const sessionDuration = session.rememberMe ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
        
        if (now - session.loginTime < sessionDuration) {
          const userData = JSON.parse(savedUser);
          // Verify user still exists in storage
          const currentUser = userStorage.getUserById(userData.id);
          if (currentUser && currentUser.isActive) {
            setUser(userData);
            setSessionExpired(false);
          } else {
            // User no longer exists or is inactive
            localStorage.removeItem('user');
            localStorage.removeItem('session');
            setSessionExpired(true);
          }
        } else {
          // Session expired, clear data
          localStorage.removeItem('user');
          localStorage.removeItem('session');
          setSessionExpired(true);
        }
      }
      setLoading(false);
    };

    checkUserSession();
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Authenticate user using proper storage system
      const authResult = userStorage.authenticateUser(email, password);
      
      if (authResult.success && authResult.user) {
        // Convert StoredUser to User interface (remove passwordHash)
        const { passwordHash, ...userData } = authResult.user;
        const user: User = userData;
        
        // Ensure user is in global database and update online status
        const globalUser = globalUserDatabase.getUserByEmail(user.email);
        if (!globalUser) {
          // Add user to global database if not present
          const userFromStorage = userStorage.getUserByEmail(user.email);
          if (userFromStorage) {
            globalUserDatabase.syncExistingUsers([userFromStorage]);
          }
        }
        globalUserDatabase.updateUserOnlineStatus(user.email, true);
        
        setUser(user);
        
        // Save session data
        const sessionData = {
          loginTime: new Date().getTime(),
          rememberMe: rememberMe,
          userId: user.id
        };
        localStorage.setItem('session', JSON.stringify(sessionData));
        
        setSessionExpired(false);
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Register user in both local storage and global database
      const registerResult = userStorage.registerUser({ name, email, password });
      
      if (registerResult.success && registerResult.user) {
        // Also register in global database for invitation system
        const globalResult = globalUserDatabase.registerUser({ name, email, password });
        
        if (!globalResult.success) {
          console.warn('Failed to register user in global database:', globalResult.message);
        }
        
        // Convert StoredUser to User interface (remove passwordHash)
        const { passwordHash, ...userData } = registerResult.user;
        const user: User = userData;
        
        setUser(user);
        
        // Save session data
        const sessionData = {
          loginTime: new Date().getTime(),
          rememberMe: false,
          userId: user.id
        };
        localStorage.setItem('session', JSON.stringify(sessionData));
        
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    // Update user online status before logout
    if (user) {
      globalUserDatabase.updateUserOnlineStatus(user.email, false);
    }
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    setSessionExpired(false);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updateResult = userStorage.updateUser(user.id, updates);
      
      if (updateResult.success && updateResult.user) {
        // Convert StoredUser to User interface (remove passwordHash)
        const { passwordHash, ...userData } = updateResult.user;
        const updatedUser: User = userData;
        
        setUser(updatedUser);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    loading,
    sessionExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
