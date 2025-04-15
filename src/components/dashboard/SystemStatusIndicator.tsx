
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SystemStatusIndicator = () => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastChecked, setLastChecked] = useState<string>('');
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple query to test the connection
        const { data, error } = await supabase
          .from('Facility_Master')
          .select('count')
          .limit(1)
          .single();
          
        if (error) {
          console.error('Database connection error:', error);
          setDbStatus('disconnected');
          toast.error('Database connection failed');
        } else {
          console.log('Database connected successfully');
          setDbStatus('connected');
        }
      } catch (err) {
        console.error('Error checking database connection:', err);
        setDbStatus('disconnected');
      }
      
      setLastChecked(new Date().toLocaleTimeString());
    };
    
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {dbStatus === 'checking' && (
              <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
            )}
            {dbStatus === 'connected' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {dbStatus === 'disconnected' && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Database: {dbStatus === 'checking' ? 'Checking connection...' : dbStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </p>
            <p className="text-xs text-muted-foreground">Last checked: {lastChecked}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusIndicator;
