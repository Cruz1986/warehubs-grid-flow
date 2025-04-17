
import { useState, useEffect } from 'react';
import { useToteScan } from './tote/useToteScan';
import { useConsignmentManagement } from './consignment/useConsignmentManagement';
import { Tote } from '@/components/operations/ToteTable';
import { toast } from 'sonner';

export const useOutboundProcessing = (userFacility: string) => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  
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
    expectedToteCount,
    receivedToteCount,
    isProcessing: isConsignmentProcessing,
    generateConsignment,
    completeOutbound: finalizeOutbound,
    showConsignmentPopup,
    setShowConsignmentPopup
  } = useConsignmentManagement(recentScans, userFacility, selectedDestination);

  // Auto-update all totes with consignment info when available
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
    // Always handle consignment generation automatically during outbound completion
    const success = await finalizeOutbound();
    
    if (success) {
      setShowCompletedMessage(true);
      
      // Auto-reset after displaying completion message
      setTimeout(() => {
        setShowCompletedMessage(false);
        resetScans();
        setSelectedDestination('');
      }, 8000);
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
    expectedToteCount,
    receivedToteCount,
    showCompletedMessage,
    showConsignmentPopup,
    startScanning,
    completeOutbound,
    handleToteScan,
    setShowConsignmentPopup
  };
};
