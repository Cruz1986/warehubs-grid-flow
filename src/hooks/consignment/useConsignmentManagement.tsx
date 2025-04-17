
import { useConsignmentState } from './useConsignmentState';
import { useConsignmentActions } from './useConsignmentActions';
import { Tote } from '@/components/operations/ToteTable';

export const useConsignmentManagement = (
  recentScans: Tote[], 
  userFacility: string, 
  selectedDestination: string
) => {
  const {
    consignmentId,
    consignmentStatus,
    expectedToteCount,
    receivedToteCount,
    setConsignmentId,
    setConsignmentStatus,
    setExpectedToteCount,
    setReceivedToteCount
  } = useConsignmentState(recentScans);

  const {
    isProcessing,
    generateConsignment,
    completeOutbound: finalizeOutbound,
    fetchConsignmentDetails
  } = useConsignmentActions(recentScans, userFacility, selectedDestination);

  const handleGenerateConsignment = async () => {
    const result = await generateConsignment();
    if (result) {
      setConsignmentId(result.consignmentId);
      setConsignmentStatus(result.status);
      return result;
    }
    return null;
  };

  const completeOutbound = async () => {
    return finalizeOutbound(consignmentId);
  };

  const loadConsignmentDetails = async (selectedConsignmentId: string) => {
    const details = await fetchConsignmentDetails(selectedConsignmentId);
    if (details) {
      setConsignmentId(details.consignmentId);
      setConsignmentStatus(details.status);
      setExpectedToteCount(details.toteCount);
      return details;
    }
    return null;
  };

  return {
    consignmentId,
    consignmentStatus,
    expectedToteCount,
    receivedToteCount,
    isProcessing,
    generateConsignment: handleGenerateConsignment,
    completeOutbound,
    loadConsignmentDetails
  };
};
