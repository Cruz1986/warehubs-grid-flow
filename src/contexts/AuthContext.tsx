
import React, { createContext, useContext, useState } from 'react';

// Define a simplified context type without authentication
interface AuthContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  login: (asAdmin: boolean) => void;
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

// Provider component that wraps the app and makes auth object available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to non-admin access
  const [isAdmin, setIsAdmin] = useState(false);

  // Simple login function that sets admin status
  const login = (asAdmin: boolean) => {
    setIsAdmin(asAdmin);
    
    // Store role in localStorage for persistence
    const userData = {
      isAdmin: asAdmin,
      facility: asAdmin ? 'All Facilities' : 'Fulfillment Center 1'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    isAdmin,
    setIsAdmin,
    login
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
