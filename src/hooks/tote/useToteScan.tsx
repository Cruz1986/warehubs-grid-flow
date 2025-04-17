import { useState, useRef } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';
import { useToteRegister } from '@/hooks/useToteRegister';

export const useToteScan = (userFacility: string, selectedDestination: string) => {
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [recentScans, setRecentScans] = useState<Tote[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const toteInputRef = useRef<HTMLInputElement>(null);
  
  // Use tote register hook for better lifecycle tracking
  const { 
    trackToteFacilityTransfer, 
    updateToteRegister,
    updateToteConsignment,
    getToteRegisterInfo 
  } = useToteRegister();

  const startScanning = () => {
    if (!selectedDestination) {
      toast.error("Please select a destination facility before starting");
      return;
    }
    
    // Validate that destination is not the current facility
    if (selectedDestination === userFacility) {
      toast.error("Destination cannot be the current facility");
      return;
    }
    
    setIsScanningActive(true);
    toast.success(`Started outbound scanning to ${selectedDestination}`);
    
    // Focus on tote input with a slight delay
    setTimeout(() => {
      if (toteInputRef.current) {
        toteInputRef.current.focus();
      }
    }, 100);
  };

  const logError = async (toteId: string, errorMessage: string) => {
    try {
      // Get the username from localStorage
      const username = localStorage.getItem('username') || 'unknown';
      
      // Log the error in scan_error_logs table
      const { error } = await supabase
        .from('scan_error_logs')
        .insert({
          tote_id: toteId,
          error_message: errorMessage,
          operator: username,
          operation_type: 'outbound',
          scan_data: { 
            tote_id: toteId, 
            destination: selectedDestination,
            facility: userFacility
          }
        });
        
      if (error) {
        console.error('Error logging scan error:', error);
      }
    } catch (err) {
      console.error('Exception logging scan error:', err);
    }
  };

  const handleToteScan = async (toteId: string) => {
    if (!isScanningActive) {
      toast.error("Please start the scanning process first");
      return;
    }
    
    // Check if tote already scanned in this session
    if (recentScans.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been scanned in this session`);
      return;
    }
    
    setIsProcessing(true);
    
    try {      
      // Get the username from localStorage
      const username = localStorage.getItem('username') || 'unknown';
      
      // Check if tote exists in register to determine source info
      const existingTote = await getToteRegisterInfo(toteId);
      
      // If tote doesn't exist in the register, it's a new tote being added to the system
      const isNewTote = !existingTote;
      
      // Determine the source facility - use existing data or current facility
      const sourceFacility = existingTote?.current_facility || userFacility;
      
      // Insert into outbound
      const timestamp = new Date().toISOString();
      const insertData = {
        tote_id: toteId,
        status: 'outbound',
        destination: selectedDestination,
        operator_name: username,
        timestamp_out: timestamp
      };
      
      const { error: insertError } = await supabase
        .from('tote_outbound')
        .insert(insertData);
        
      if (insertError) {
        console.error('Error saving outbound tote:', insertError);
        toast.error(`Failed to save outbound tote: ${insertError.message}`);
        await logError(toteId, `Failed to save outbound: ${insertError.message}`);
        setIsProcessing(false);
        return;
      }
      
      // Track the tote transfer between facilities
      await trackToteFacilityTransfer(
        toteId,
        sourceFacility,
        selectedDestination,
        username,
        'outbound'
      );
      
      // Also update the tote register directly to ensure it's in sync
      await updateToteRegister(toteId, {
        current_status: 'outbound',
        current_facility: sourceFacility,
        destination: selectedDestination,
        ob_timestamp: timestamp,
        outbound_by: username,
        activity: `Outbound scan from ${sourceFacility} to ${selectedDestination}`
      });
      
      // Add to local state
      const newTote: Tote = {
        id: toteId,
        status: 'outbound' as 'outbound',
        source: sourceFacility,
        destination: selectedDestination,
        timestamp: timestamp,
        user: username,
        currentFacility: sourceFacility,
        isNewTote: isNewTote
      };
      
      setRecentScans(prevScans => [newTote, ...prevScans]);
      
      if (isNewTote) {
        toast.success(`New tote ${toteId} added to outbound batch for ${selectedDestination}`);
      } else {
        toast.success(`Tote ${toteId} has been added to outbound batch for ${selectedDestination}`);
      }
      
      // Refocus on tote input for continuous scanning
      if (toteInputRef.current) {
        toteInputRef.current.focus();
        toteInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Exception processing outbound tote:', err);
      toast.error('An unexpected error occurred while processing the tote');
      await logError(toteId, `Exception: ${String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScans = () => {
    setRecentScans([]);
    setIsScanningActive(false);
  };

  // Update all totes with consignment info
  const updateTotesWithConsignment = async (consignmentId: string) => {
    for (const tote of recentScans) {
      await updateToteConsignment(tote.id, consignmentId);
    }
    
    // Update UI with consignment info
    const updatedScans = recentScans.map(tote => ({
      ...tote,
      consignmentId,
      consignmentStatus: 'In Transit'
    }));
    
    setRecentScans(updatedScans as Tote[]);
  };

  return {
    isScanningActive,
    recentScans,
    isProcessing,
    toteInputRef,
    startScanning,
    handleToteScan,
    resetScans,
    updateRecentScans: setRecentScans,
    updateTotesWithConsignment
  };
};