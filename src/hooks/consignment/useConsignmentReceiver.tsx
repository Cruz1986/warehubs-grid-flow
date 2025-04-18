
import { useState } from 'react';
import { useFetchConsignments } from './useFetchConsignments';
import { useReceiveConsignment } from './useReceiveConsignment';
import { Consignment } from '@/types/consignment';

export const useConsignmentReceiver = (currentFacility: string, isAdmin: boolean = false) => {
  const { consignments, isLoading, error, refetchConsignments } = useFetchConsignments(currentFacility, isAdmin);
  const { handleReceiveConsignment: receiveConsignment, isProcessing } = useReceiveConsignment(currentFacility);

  const [currentConsignment, setCurrentConsignment] = useState<Consignment | null>(null);
  const [showDiscrepancy, setShowDiscrepancy] = useState(false);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReceiveConsignment = async (consignmentId: string) => {
    const consignment = consignments.find(c => c.id === consignmentId);
    if (!consignment) return;
    
    setCurrentConsignment(consignment);
    const result = await receiveConsignment(consignmentId);
    
    if (result && result.received_count !== consignment.toteCount) {
      setShowDiscrepancy(true);
    } else {
      setCurrentConsignment(null);
    }
    
    refetchConsignments();
  };

  const handleDiscrepancyConfirm = async () => {
    setShowDiscrepancy(false);
    setCurrentConsignment(null);
    refetchConsignments();
  };

  const handleDiscrepancyClose = () => {
    setShowDiscrepancy(false);
    setCurrentConsignment(null);
    refetchConsignments();
  };

  return {
    consignments,
    isLoading: isLoading || isProcessing,
    error,
    handleReceiveConsignment,
    currentConsignment,
    showDiscrepancy,
    handleDiscrepancyConfirm,
    handleDiscrepancyClose,
    formatDate,
    refetchConsignments
  };
};
