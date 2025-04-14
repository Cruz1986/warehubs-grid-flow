
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  login: (asAdmin: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (asAdmin: boolean) => {
    setIsAdmin(asAdmin);
    
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
