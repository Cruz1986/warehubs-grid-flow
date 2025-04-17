
import { useState, useEffect } from 'react';
import { useToteScan } from './tote/useToteScan';
import { useConsignmentManagement } from './consignment/useConsignmentManagement';
import { Tote } from '@/components/operations/ToteTable';
import { useToteRegister } from './useToteRegister';
import { supabase } from '@/integrations/supabase/client';

export const useOutboundProcessing = (userFacility: string) => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const { updateToteRegister, createToteRegister } = useToteRegister();
  
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
    completeOutbound: finalizeOutbound
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
      // Update tote_register for all totes in outbound
      const username = localStorage.getItem('username') || 'unknown';
      const timestamp = new Date().toISOString();
      
      for (const tote of recentScans) {
        // Check if tote exists in register
        const toteInfo = await supabase
          .from('tote_register')
          .select('*')
          .eq('tote_id', tote.id)
          .maybeSingle();
          
        if (toteInfo.data) {
          // Update existing tote
          await updateToteRegister(tote.id, {
            current_status: 'intransit',
            current_facility: userFacility,
            outbound_timestamp: timestamp,
            outbound_operator: username,
            staged_destination: selectedDestination
          });
        } else {
          // Create new tote register entry
          await createToteRegister(tote.id, {
            current_status: 'intransit',
            current_facility: userFacility,
            source_facility: userFacility,
            outbound_timestamp: timestamp,
            outbound_operator: username,
            staged_destination: selectedDestination
          });
        }
      }
      
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
    expectedToteCount,
    receivedToteCount,
    startScanning,
    completeOutbound,
    handleToteScan
  };
};
