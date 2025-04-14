
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user type
interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

// Define types for our context
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Define some mock users for local authentication
const mockUsers = [
  { id: '1', email: 'admin@example.com', password: 'admin123', isAdmin: true },
  { id: '2', email: 'user@example.com', password: 'user123', isAdmin: false }
];

// Provider component that wraps the app and makes auth object available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Login function - checks against mock users
  async function login(email: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      const user = mockUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        setIsAdmin(user.isAdmin);
        
        // Store in localStorage
        localStorage.setItem('wms_user', JSON.stringify(userWithoutPassword));
        resolve();
      } else {
        reject(new Error('Invalid email or password'));
      }
    });
  }

  // Log out function
  async function logout() {
    return new Promise<void>((resolve) => {
      setCurrentUser(null);
      setIsAdmin(false);
      localStorage.removeItem('wms_user');
      resolve();
    });
  }

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('wms_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAdmin(user.isAdmin);
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
