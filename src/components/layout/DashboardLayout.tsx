
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbLastChecked, setDbLastChecked] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Check database connection with retry logic
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log(`Database connection check attempt ${connectionAttempts + 1}...`);
        const startTime = Date.now();
        const { error, count } = await supabase.from('facilities').select('*', { count: 'exact', head: true });
        const endTime = Date.now();
        
        if (error) {
          console.error('Database connection check failed:', error);
          setDbError(error.message || 'Failed to connect to database');
          
          // If we haven't tried too many times, retry after a delay
          if (connectionAttempts < 3) {
            setConnectionAttempts(prev => prev + 1);
            setTimeout(checkConnection, 3000); // Retry after 3 seconds
          }
        } else {
          const responseTime = endTime - startTime;
          setDbError(null);
          setDbLastChecked(`Success (${responseTime}ms) - Found ${count} facilities`);
          console.log('Database connected successfully', { responseTime, count });
        }
      } catch (err) {
        console.error('Database connection check error:', err);
        setDbError('Error connecting to database');
        
        // If we haven't tried too many times, retry after a delay
        if (connectionAttempts < 3) {
          setConnectionAttempts(prev => prev + 1);
          setTimeout(checkConnection, 3000); // Retry after 3 seconds
        }
      }
    };
    
    checkConnection();
    
    // Set up an interval to check the connection periodically
    const interval = setInterval(() => {
      setConnectionAttempts(0); // Reset attempts for periodic checks
      checkConnection();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [connectionAttempts]);

  useEffect(() => {
    // Create a channel to listen for all database changes
    const channel = supabase
      .channel('any-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Database change detected:', payload);
        const { table, eventType, new: newRecord, old: oldRecord } = payload;
        
        // Show toast notification for database changes
        toast.info(`${eventType} operation on ${table}`, {
          description: `Database updated at ${new Date().toLocaleTimeString()}`,
          icon: <Database className="h-4 w-4" />
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
                  <div className="mt-2 text-xs">
                    Make sure your Supabase project is running and the connection details in src/integrations/supabase/client.ts are correct.
                    <br />
                    Connection attempts: {connectionAttempts}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {dbLastChecked && !dbError && (
              <div className="text-xs text-gray-500 mb-2 flex items-center">
                <Database className="h-3 w-3 mr-1 text-green-500" />
                DB Status: {dbLastChecked} - Last checked: {new Date().toLocaleTimeString()}
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
