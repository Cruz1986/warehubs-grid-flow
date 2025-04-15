
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import ActivityCard from '../components/dashboard/ActivityCard';
import GridCapacityVisual from '../components/dashboard/GridCapacityVisual';
import ToteTabs from '../components/dashboard/ToteTabs';
import { useStatusData } from '@/hooks/useStatusData';

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

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Status Dashboard</h1>
      
      <StatusCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ActivityCard 
          facilityData={facilityData} 
          isLoading={isLoadingActivity} 
        />
        
        <GridCapacityVisual 
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
