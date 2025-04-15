
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import ActivityCard from '../components/dashboard/ActivityCard';
import GridCapacityVisual from '../components/dashboard/GridCapacityVisual';
import ToteTabs from '../components/dashboard/ToteTabs';
import SystemStatusIndicator from '../components/dashboard/SystemStatusIndicator';
import DatabaseStatusCard from '../components/dashboard/DatabaseStatusCard';
import { useStatusData } from '@/hooks/useStatusData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DatabaseIcon, RefreshCcw } from 'lucide-react';

const Status = () => {
  const {
    inboundTotes,
    stagedTotes,
    outboundTotes,
    facilityData,
    gridStatuses,
    isLoadingTotes,
    isLoadingActivity,
    isLoadingGrids
  } = useStatusData();
  
  const [lastDbOperation, setLastDbOperation] = useState<string | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  // Function to test database connection with a simple query
  const testDatabaseConnection = async () => {
    setIsTestingDb(true);
    try {
      // Attempt to count facilities as a simple test query
      const { count, error } = await supabase
        .from('Facility_Master')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error("Database test failed:", error);
        toast.error(`Database operation failed: ${error.message}`);
        setLastDbOperation(`Failed: ${error.message}`);
      } else {
        toast.success(`Connected to database. Found ${count} facilities.`);
        setLastDbOperation(`Success: Connected to database. Counted ${count} facilities.`);
        console.log("Database test succeeded:", count);
      }
    } catch (err) {
      console.error("Database test exception:", err);
      toast.error(`Database exception: ${err instanceof Error ? err.message : String(err)}`);
      setLastDbOperation(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsTestingDb(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold">Status Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <StatusCards />
          </div>
          <div className="md:col-span-1">
            <SystemStatusIndicator />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <DatabaseIcon className="mr-2 h-5 w-5 text-blue-500" />
              Database Connection Status
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testDatabaseConnection} 
              disabled={isTestingDb}
              className="flex items-center"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {isTestingDb ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="mb-2">Last database operation: {lastDbOperation || 'No operations recorded'}</p>
            <p className="text-xs text-gray-500">
              If database entries are not appearing, check your network connection and Supabase project configuration.
            </p>
          </div>
        </div>
        
        <DatabaseStatusCard />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActivityCard 
            facilityData={facilityData} 
            isLoading={isLoadingActivity} 
          />
          
          <GridCapacityVisual 
            gridStatuses={gridStatuses} 
            isLoading={isLoadingGrids} 
          />
        </div>
        
        <div>
          <ToteTabs 
            inboundTotes={inboundTotes}
            stagedTotes={stagedTotes}
            outboundTotes={outboundTotes}
            isLoading={isLoadingTotes}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Status;
