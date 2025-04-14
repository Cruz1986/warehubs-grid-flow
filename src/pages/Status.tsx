
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import ActivityCard from '../components/dashboard/ActivityCard';
import GridCapacityDisplay from '../components/dashboard/GridCapacityDisplay';
import ToteTabs from '../components/dashboard/ToteTabs';
import { useToteData } from '@/hooks/useToteData';
import { useFacilityData } from '@/hooks/useFacilityData';
import { useGridStatusData } from '@/hooks/useGridStatusData';

const Status = () => {
  const { inboundTotes, stagedTotes, outboundTotes, isLoadingTotes } = useToteData();
  const { facilityData, isLoadingActivity } = useFacilityData();
  const { gridStatuses, isLoadingGrids } = useGridStatusData();

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Status Dashboard</h1>
      
      <StatusCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ActivityCard
          facilityData={facilityData}
          isLoading={isLoadingActivity}
        />
        
        <GridCapacityDisplay
          gridStatuses={gridStatuses}
          isLoading={isLoadingGrids}
        />
      </div>
      
      <div className="mt-6">
        <ToteTabs
          inboundTotes={inboundTotes}
          stagedTotes={stagedTotes}
          outboundTotes={outboundTotes}
          isLoading={isLoadingTotes}
        />
      </div>
    </DashboardLayout>
  );
};

export default Status;
