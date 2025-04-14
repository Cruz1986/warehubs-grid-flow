
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  role: string;
  facility: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const initialAuthContext: AuthContextType = {
  user: null,
  setUser: () => {},
  loading: true,
  isAdmin: false,
  isAuthenticated: false,
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(initialAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log("Checking initial session...");
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Found existing session", session.user);
          // Get the user data from the session and auth metadata
          const email = session.user.email || '';
          const role = session.user.user_metadata?.role || 'user';
          
          setUser({
            id: session.user.id,
            email,
            role,
            facility: session.user.user_metadata?.facility || 'Default Facility',
            isAuthenticated: true,
            isAdmin: role === 'admin'
          });
        } else {
          console.log("No existing session found");
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Get metadata from the session instead of querying the users table
          const email = session.user.email || '';
          const role = session.user.user_metadata?.role || 'user';
          
          setUser({
            id: session.user.id,
            email,
            role,
            facility: session.user.user_metadata?.facility || 'Default Facility',
            isAuthenticated: true,
            isAdmin: role === 'admin'
          });
          
          setLoading(false);
          
          if (role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/inbound');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          navigate('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
      toast.error('Error logging out');
    } finally {
      setLoading(false);
    }
  };

  const authContextValue: AuthContextType = {
    user,
    setUser,
    loading,
    isAdmin: user?.isAdmin || false,
    isAuthenticated: !!user?.isAuthenticated,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
