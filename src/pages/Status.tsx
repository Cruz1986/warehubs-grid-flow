
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import ActivityCard from '../components/dashboard/ActivityCard';
import GridCapacityVisual from '../components/dashboard/GridCapacityVisual';
import ToteTabs from '../components/dashboard/ToteTabs';
import SystemStatusIndicator from '../components/dashboard/SystemStatusIndicator';
import { useStatusData } from '@/hooks/useStatusData';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Status = () => {
  const {
    inboundTotes,
    stagedTotes,
    outboundTotes,
    facilityData,
    gridStatuses,
    isLoadingTotes,
    isLoadingActivity,
    isLoadingGrids,
    error
  } = useStatusData();

  console.log('Status dashboard data:', {
    inboundCount: inboundTotes.length,
    stagedCount: stagedTotes.length,
    outboundCount: outboundTotes.length,
    isLoading: isLoadingTotes,
    error
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold">Status Dashboard</h1>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <StatusCards />
          </div>
          <div className="md:col-span-1">
            <SystemStatusIndicator />
          </div>
        </div>
        
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
            error={error}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Status;
