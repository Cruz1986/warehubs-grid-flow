
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Check database connection
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('facilities').select('count').limit(1);
        if (error) {
          console.error('Database connection check failed:', error);
          setDbError(error.message || 'Failed to connect to database');
        } else {
          setDbError(null);
        }
      } catch (err) {
        console.error('Database connection check error:', err);
        setDbError('Error connecting to database');
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    // Redirect if no user is logged in
    if (!user) {
      navigate('/');
      return;
    }

    // Redirect if admin access is required but user is not an admin
    if (requireAdmin && user.role !== 'admin') {
      navigate('/inbound');
    }
  }, [user, navigate, requireAdmin]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header>
          <MobileSidebar />
        </Header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            {dbError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Database Connection Error</AlertTitle>
                <AlertDescription>
                  {dbError}. Live data updates may not work correctly.
                </AlertDescription>
              </Alert>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
