import { useState, useEffect } from 'react';
import { useToteScan } from './tote/useToteScan';
import { useConsignmentManagement } from './consignment/useConsignmentManagement';
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
      setTimeout(() => {
        resetScans();
        setSelectedDestination('');
      }, 5000);
    }
  };

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
