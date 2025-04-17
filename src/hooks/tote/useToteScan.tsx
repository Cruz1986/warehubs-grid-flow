
import { useState, useRef } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';

export const useToteScan = (userFacility: string, selectedDestination: string) => {
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [recentScans, setRecentScans] = useState<Tote[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const toteInputRef = useRef<HTMLInputElement>(null);

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
      // First check if the tote exists in tote_register
      const { data: registerData, error: registerError } = await supabase
        .from('tote_register')
        .select('*')
        .eq('tote_id', toteId)
        .maybeSingle();
        
      if (registerError) {
        console.error('Error checking tote_register:', registerError);
      }
      
      // Check if the tote is already in transit via a different consignment
      if (registerData && registerData.current_status === 'intransit' && registerData.staged_destination !== selectedDestination) {
        const warningMsg = `Tote ${toteId} is already in transit to ${registerData.staged_destination}`;
        await logError(toteId, warningMsg);
        toast.warning(warningMsg);
        setIsProcessing(false);
        return;
      }
      
      // Get the username from localStorage
      const username = localStorage.getItem('username') || 'unknown';
      
      // Prepare source information - can be from register or current facility for direct outbound
      let originalSource = registerData?.source_facility || userFacility;
      
      // Determine if we need to check staging status or allow direct outbound
      let canProceed = true;
      let gridNumber = undefined;
      
      // Only check staging status if the tote is currently at this facility and has been staged
      if (registerData && registerData.current_facility === userFacility && registerData.current_status === 'staged') {
        // Check if the tote is staged for the selected destination
        const { data: stagedTotes, error: stagedError } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('tote_id', toteId)
          .eq('status', 'staged')
          .maybeSingle();
          
        if (stagedError) {
          console.error('Error verifying tote staging status:', stagedError);
        }
        
        if (stagedTotes) {
          // Only proceed if staged for the correct destination
          if (stagedTotes.destination !== selectedDestination) {
            const errorMsg = `Tote ${toteId} is staged for ${stagedTotes.destination}, not ${selectedDestination}`;
            await logError(toteId, errorMsg);
            toast.error(errorMsg);
            canProceed = false;
          } else {
            gridNumber = stagedTotes.grid_no;
            // Update staging status
            const { error: updateError } = await supabase
              .from('tote_staging')
              .update({ status: 'shipped' })
              .eq('tote_id', toteId);
              
            if (updateError) {
              console.error('Error updating staging status:', updateError);
            }
          }
        }
      }
      
      if (!canProceed) {
        setIsProcessing(false);
        return;
      }
      
      // Insert into outbound
      const insertData = {
        tote_id: toteId,
        status: 'outbound',
        destination: selectedDestination,
        operator_name: username
      };
      
      const { error: insertError } = await supabase
        .from('tote_outbound')
        .insert(insertData);
        
      if (insertError) {
        console.error('Error saving outbound tote:', insertError);
        toast.error(`Failed to save outbound tote: ${insertError.message}`);
        setIsProcessing(false);
        return;
      }
      
      // Update or create tote_register record
      if (registerData) {
        // Update existing record
        const { error: updateRegisterError } = await supabase
          .from('tote_register')
          .update({
            current_status: 'outbound',
            outbound_timestamp: new Date().toISOString(),
            outbound_operator: username,
            staged_destination: selectedDestination
          })
          .eq('tote_id', toteId);
          
        if (updateRegisterError) {
          console.error('Error updating tote_register:', updateRegisterError);
        }
      } else {
        // Create a new tote_register record for direct outbound
        const { error: createRegisterError } = await supabase
          .from('tote_register')
          .insert({
            tote_id: toteId,
            current_status: 'outbound',
            current_facility: userFacility,
            source_facility: userFacility, // Source is current facility for direct outbound
            outbound_timestamp: new Date().toISOString(),
            outbound_operator: username,
            staged_destination: selectedDestination
          });
          
        if (createRegisterError) {
          console.error('Error creating tote_register:', createRegisterError);
        }
      }
      
      // Add to local state
      const newTote: Tote = {
        id: toteId,
        status: 'outbound' as 'outbound',
        source: originalSource,
        destination: selectedDestination,
        timestamp: new Date().toISOString(),
        user: username,
        currentFacility: userFacility,
        grid: gridNumber
      };
      
      setRecentScans(prevScans => [newTote, ...prevScans]);
      toast.success(`Tote ${toteId} has been added to outbound batch for ${selectedDestination}`);
      
      // Refocus on tote input for continuous scanning
      if (toteInputRef.current) {
        toteInputRef.current.focus();
        toteInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Exception processing outbound tote:', err);
      toast.error('An unexpected error occurred while processing the tote');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScans = () => {
    setRecentScans([]);
    setIsScanningActive(false);
  };

  return {
    isScanningActive,
    recentScans,
    isProcessing,
    toteInputRef,
    startScanning,
    handleToteScan,
    resetScans,
    updateRecentScans: setRecentScans
  };
};
