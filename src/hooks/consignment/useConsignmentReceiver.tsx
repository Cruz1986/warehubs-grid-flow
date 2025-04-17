
import { useFetchConsignments } from './useFetchConsignments';
import { useReceiveConsignment } from './useReceiveConsignment';
import { Consignment } from '@/types/consignment';

export const useConsignmentReceiver = (currentFacility: string) => {
  const { consignments, isLoading, error } = useFetchConsignments(currentFacility);
  const { handleReceiveConsignment, isProcessing } = useReceiveConsignment(currentFacility);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    consignments,
    isLoading: isLoading || isProcessing,
    error,
    handleReceiveConsignment,
    formatDate
  };
};
