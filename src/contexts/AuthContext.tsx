
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
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user data from our custom users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('username', session.user.email)
            .single();

          if (userError && userError.code !== 'PGSQL_ERROR') {
            console.error("Error fetching user data:", userError);
            setUser(null);
          } else if (userData) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: userData.role || 'user',
              facility: userData.facility || 'Default Facility',
              isAuthenticated: true,
              isAdmin: userData.role === 'admin'
            });
          } else {
            // User in auth but not in our custom table, create record
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                username: session.user.email || '',
                password: 'supabase-auth',
                role: 'user',
                facility: 'Default Facility'
              });

            if (insertError) {
              console.error("Error creating user:", insertError);
              setUser(null);
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: 'user',
                facility: 'Default Facility',
                isAuthenticated: true,
                isAdmin: false
              });
            }
          }
        } else {
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
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user data from our custom users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('username', session.user.email)
            .single();

          if (userError && userError.code !== 'PGSQL_ERROR') {
            console.error("Error fetching user data:", userError);
          } else if (userData) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: userData.role || 'user',
              facility: userData.facility || 'Default Facility',
              isAuthenticated: true,
              isAdmin: userData.role === 'admin'
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
      toast.error('Error logging out');
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
