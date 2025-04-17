
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
    setConsignmentId,
    setConsignmentStatus
  } = useConsignmentState(recentScans);

  const {
    isProcessing,
    generateConsignment,
    completeOutbound: finalizeOutbound
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

  return {
    consignmentId,
    consignmentStatus,
    isProcessing,
    generateConsignment: handleGenerateConsignment,
    completeOutbound
  };
};
