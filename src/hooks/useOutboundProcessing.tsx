
import { useState, useEffect } from 'react';
import { useToteScan } from './tote/useToteScan';
import { useConsignmentManagement } from './consignment/useConsignmentManagement';
import { toast } from "sonner";
import { Tote } from '@/components/operations/ToteTable';

export const useOutboundProcessing = (userFacility: string) => {
  const [selectedDestination, setSelectedDestination] = useState('');
  
  const { 
    isScanningActive,
    recentScans,
    isProcessing: isScanningProcessing,
    toteInputRef,
    startScanning,
    handleToteScan,
    resetScans,
    updateRecentScans
  } = useToteScan(userFacility, selectedDestination);
  
  const {
    consignmentId,
    consignmentStatus,
    isProcessing: isConsignmentProcessing,
    generateConsignment,
    completeOutbound: finalizeOutbound
  } = useConsignmentManagement(recentScans, userFacility, selectedDestination);

  // Update scans with consignment info when consignment changes
  useEffect(() => {
    if (consignmentId && recentScans.length > 0) {
      const updatedScans = recentScans.map(tote => ({
        ...tote,
        consignmentId: consignmentId,
        consignmentStatus: consignmentStatus
      }));
      
      updateRecentScans(updatedScans as Tote[]);
    }
  }, [consignmentId, consignmentStatus]);

  const completeOutbound = async () => {
    const success = await finalizeOutbound();
    
    if (success) {
      // Reset the form after a delay
      setTimeout(() => {
        resetScans();
        setSelectedDestination('');
      }, 5000); // Give users time to see the completion message
    }
  };

  // Combined isProcessing state
  const isProcessing = isScanningProcessing || isConsignmentProcessing;

  return {
    selectedDestination,
    setSelectedDestination,
    isProcessing,
    isScanningActive,
    recentScans,
    toteInputRef,
    consignmentId,
    consignmentStatus,
    startScanning,
    completeOutbound,
    handleToteScan,
    generateConsignment
  };
};
