
import { useMemo } from 'react';
import { useInboundTotes, useStagedTotes, useOutboundTotes } from './useToteData';
import { useFacilityData } from './useFacilityData';
import { useGridStatuses } from './useGridStatuses';

export const useStatusData = () => {
  // Use the separate hooks to fetch each piece of data
  const { inboundTotes, isLoading: isLoadingInbound } = useInboundTotes();
  const { stagedTotes, isLoading: isLoadingStaged } = useStagedTotes();
  const { outboundTotes, isLoading: isLoadingOutbound } = useOutboundTotes();
  const { facilityData, isLoading: isLoadingActivity } = useFacilityData();
  const { gridStatuses, isLoading: isLoadingGrids } = useGridStatuses();

  // Combine loading states
  const isLoadingTotes = useMemo(() => {
    return isLoadingInbound || isLoadingStaged || isLoadingOutbound;
  }, [isLoadingInbound, isLoadingStaged, isLoadingOutbound]);

  // Return the combined data and loading states
  return {
    inboundTotes,
    stagedTotes,
    outboundTotes,
    facilityData,
    gridStatuses,
    isLoadingTotes,
    isLoadingActivity,
    isLoadingGrids
  };
};
