
import { useState, useRef } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';

export const useOutboundProcessing = (userFacility: string) => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [recentScans, setRecentScans] = useState<Tote[]>([]);
  const toteInputRef = useRef<HTMLInputElement>(null);

  const startScanning = () => {
    if (!selectedDestination) {
      toast.error("Please select a destination facility before starting");
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

  const completeOutbound = async () => {
    if (recentScans.length === 0) {
      toast.warning("No totes have been scanned yet");
      return;
    }
    
    toast.success(`Completed outbound process to ${selectedDestination}`);
    
    // Reset the form
    setRecentScans([]);
    setSelectedDestination('');
    setIsScanningActive(false);
  };

  const handleToteScan = async (toteId: string) => {
    if (!isScanningActive) {
      toast.error("Please start the scanning process first");
      return;
    }
    
    // Check if tote already scanned
    if (recentScans.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been scanned`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Check if tote exists and is staged for the selected destination
      const { data: stagedTotes, error: stagedError } = await supabase
        .from('tote_staging')
        .select('*')
        .eq('tote_id', toteId)
        .eq('status', 'staged')
        .maybeSingle();
        
      if (stagedError) {
        toast.error(`Error verifying tote status: ${stagedError.message}`);
        setIsProcessing(false);
        return;
      }
      
      if (!stagedTotes) {
        toast.error(`Tote ${toteId} is not staged for outbound processing`);
        setIsProcessing(false);
        return;
      }
      
      // Check if tote is staged for the correct destination
      if (stagedTotes.destination !== selectedDestination) {
        toast.error(`Tote ${toteId} is staged for ${stagedTotes.destination}, not ${selectedDestination}`);
        setIsProcessing(false);
        return;
      }
      
      // Get the username from localStorage
      const username = localStorage.getItem('username') || 'unknown';
      
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
      
      // Update staging status
      const { error: updateError } = await supabase
        .from('tote_staging')
        .update({ status: 'shipped' })
        .eq('tote_id', toteId);
        
      if (updateError) {
        console.error('Error updating staging status:', updateError);
        // Don't block the process since the outbound record was created
        toast.warning('Tote marked as outbound but staging status update failed');
      }
      
      // Get the source from the staging record
      const source = stagedTotes.staging_facility || userFacility;
      
      // Add to local state
      const newTote: Tote = {
        id: toteId,
        status: 'outbound',
        source: source,
        destination: selectedDestination,
        timestamp: new Date().toISOString(),
        user: username,
        currentFacility: userFacility,
        grid: stagedTotes.grid_no
      };
      
      setRecentScans(prevScans => [newTote, ...prevScans]);
      toast.success(`Tote ${toteId} has been shipped to ${selectedDestination}`);
      
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

  return {
    selectedDestination,
    setSelectedDestination,
    isProcessing,
    isScanningActive,
    recentScans,
    toteInputRef,
    startScanning,
    completeOutbound,
    handleToteScan
  };
};
