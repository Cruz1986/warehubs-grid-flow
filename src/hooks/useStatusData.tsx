
import { useToteData } from './useToteData';
import { useActivityData } from './useActivityData';
import { useGridData } from './useGridData';

export const useStatusData = () => {
  const { inboundTotes, stagedTotes, outboundTotes, isLoadingTotes } = useToteData();
  const { facilityData, isLoadingActivity } = useActivityData();
  const { gridStatuses, isLoadingGrids } = useGridData();

  return {
    // Tote data
    inboundTotes,
    stagedTotes,
    outboundTotes,
    
    // Activity data
    facilityData,
    
    // Grid data
    gridStatuses,
    
    // Loading states
    isLoadingTotes,
    isLoadingActivity,
    isLoadingGrids
  };
};
