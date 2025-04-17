
import { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';

export const useOutboundProcessing = (userFacility: string) => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [recentScans, setRecentScans] = useState<Tote[]>([]);
  const [consignmentId, setConsignmentId] = useState<string | null>(null);
  const [consignmentStatus, setConsignmentStatus] = useState<string>('pending');
  const toteInputRef = useRef<HTMLInputElement>(null);

  // Check for existing consignment if there are scans
  useEffect(() => {
    if (recentScans.length > 0 && recentScans[0].consignmentId) {
      setConsignmentId(recentScans[0].consignmentId);
      setConsignmentStatus(recentScans[0].consignmentStatus || 'pending');
    }
  }, [recentScans]);

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

  const generateConsignment = async () => {
    if (recentScans.length === 0) {
      toast.warning("No totes have been scanned yet");
      return;
    }
    
    if (consignmentId) {
      toast.info(`Consignment ${consignmentId} already generated`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create a unique consignment ID
      const newConsignmentId = `CS-${userFacility.substring(0, 3)}-${Date.now().toString().substring(7)}`;
      
      // Update all scanned totes with the consignment ID
      const toteIds = recentScans.map(tote => tote.id);
      
      // Update tote_outbound records
      const { error: updateError } = await supabase
        .from('tote_outbound')
        .update({ 
          consignment_id: newConsignmentId,
          status: 'intransit' 
        })
        .in('tote_id', toteIds);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update tote_register records
      for (const toteId of toteIds) {
        const { error: registerError } = await supabase
          .from('tote_register')
          .update({
            current_status: 'intransit',
            outbound_timestamp: new Date().toISOString(),
            outbound_operator: localStorage.getItem('username') || 'unknown',
            staged_destination: selectedDestination
          })
          .eq('tote_id', toteId);
          
        if (registerError) {
          console.error(`Error updating tote_register for ${toteId}:`, registerError);
        }
      }
      
      // Log the consignment creation to audit trail
      const { error: logError } = await supabase
        .from('consignment_log')
        .insert({
          consignment_id: newConsignmentId,
          source_facility: userFacility,
          destination_facility: selectedDestination,
          tote_count: toteIds.length,
          status: 'intransit',
          created_by: localStorage.getItem('username') || 'unknown'
        });
        
      if (logError && logError.code !== '42P01') { // Ignore error if table doesn't exist yet
        console.error('Error logging consignment:', logError);
      }
      
      setConsignmentId(newConsignmentId);
      setConsignmentStatus('In Transit');
      
      // Update local state with proper type casting
      const updatedScans = recentScans.map(tote => ({
        ...tote,
        consignmentId: newConsignmentId,
        consignmentStatus: 'In Transit',
        status: 'intransit' as 'intransit' // Type assertion to match Tote interface
      }));
      
      setRecentScans(updatedScans);
      toast.success(`Consignment ${newConsignmentId} has been generated for ${toteIds.length} totes`);
    } catch (err: any) {
      console.error('Error generating consignment:', err);
      toast.error(`Failed to generate consignment: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const completeOutbound = async () => {
    if (recentScans.length === 0) {
      toast.warning("No totes have been scanned yet");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // If there's no consignment yet, generate one
      if (!consignmentId) {
        await generateConsignment();
      }
      
      // Mark the consignment as completed
      if (consignmentId) {
        const { error: consignmentError } = await supabase
          .from('consignment_log')
          .update({ 
            status: 'completed',
            completed_time: new Date().toISOString(),
            completed_by: localStorage.getItem('username') || 'unknown'
          })
          .eq('consignment_id', consignmentId);
          
        if (consignmentError && consignmentError.code !== '42P01') { // Ignore error if table doesn't exist yet
          console.error('Error updating consignment:', consignmentError);
        }
      }
      
      toast.success(`Completed outbound process to ${selectedDestination}`);
      setConsignmentStatus('Completed');
      
      // Reset the form after a delay
      setTimeout(() => {
        setRecentScans([]);
        setSelectedDestination('');
        setIsScanningActive(false);
        setConsignmentId(null);
      }, 5000); // Give users time to see the completion message
    } catch (err: any) {
      console.error('Error completing outbound process:', err);
      toast.error(`Failed to complete outbound: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
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
    
    // Check if tote already scanned
    if (recentScans.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been scanned`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // First check if the tote is already in transit or at destination
      const { data: registerData, error: registerError } = await supabase
        .from('tote_register')
        .select('*')
        .eq('tote_id', toteId)
        .maybeSingle();
        
      if (registerError) {
        console.error('Error checking tote_register:', registerError);
      }
      
      // Check if tote is already in transit
      if (registerData && registerData.current_status === 'intransit') {
        const errorMsg = `Tote ${toteId} is already in transit to ${registerData.staged_destination}`;
        await logError(toteId, errorMsg);
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }
      
      // Check if tote is at a different facility but not intended for outbound
      if (registerData && registerData.current_facility !== userFacility) {
        // If the tote is physically present but not registered to this facility, log error
        const errorMsg = `Tote ${toteId} is registered to ${registerData.current_facility}, not ${userFacility}`;
        await logError(toteId, errorMsg);
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }
      
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
        const errorMsg = `Tote ${toteId} is not staged for outbound processing`;
        await logError(toteId, errorMsg);
        toast.error(errorMsg);
        setIsProcessing(false);
        return;
      }
      
      // Check if tote is staged for the correct destination
      if (stagedTotes.destination !== selectedDestination) {
        const errorMsg = `Tote ${toteId} is staged for ${stagedTotes.destination}, not ${selectedDestination}`;
        await logError(toteId, errorMsg);
        toast.error(errorMsg);
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
      
      // Update tote_register record
      if (registerData) {
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
        // Create a new tote_register record if one doesn't exist
        const { error: createRegisterError } = await supabase
          .from('tote_register')
          .insert({
            tote_id: toteId,
            current_status: 'outbound',
            current_facility: userFacility,
            outbound_timestamp: new Date().toISOString(),
            outbound_operator: username,
            staged_destination: selectedDestination
          });
          
        if (createRegisterError) {
          console.error('Error creating tote_register:', createRegisterError);
        }
      }
      
      // Get inbound record to find the original source
      const { data: inboundTote, error: inboundError } = await supabase
        .from('tote_inbound')
        .select('source')
        .eq('tote_id', toteId)
        .maybeSingle();

      if (inboundError) {
        console.error('Error fetching inbound record:', inboundError);
      }
      
      // Use the original source from inbound if available, otherwise fallback
      const originalSource = inboundTote?.source || stagedTotes.staging_facility || 'Unknown';
      
      // Add to local state
      const newTote: Tote = {
        id: toteId,
        status: 'outbound',
        source: originalSource,
        destination: selectedDestination,
        timestamp: new Date().toISOString(),
        user: username,
        currentFacility: userFacility,
        grid: stagedTotes.grid_no,
        consignmentId: consignmentId || undefined,
        consignmentStatus: consignmentStatus === 'pending' ? undefined : consignmentStatus
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
