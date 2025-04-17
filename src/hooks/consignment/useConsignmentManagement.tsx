import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';

export const useConsignmentManagement = (recentScans: Tote[], userFacility: string, selectedDestination: string) => {
  const [consignmentId, setConsignmentId] = useState<string | null>(null);
  const [consignmentStatus, setConsignmentStatus] = useState<string>('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for existing consignment if there are scans
  useEffect(() => {
    if (recentScans.length > 0 && recentScans[0].consignmentId) {
      setConsignmentId(recentScans[0].consignmentId);
      setConsignmentStatus(recentScans[0].consignmentStatus || 'pending');
    }
  }, [recentScans]);
  
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
      // Create a unique consignment ID with facility prefixes for better tracking
      const newConsignmentId = `CS-${userFacility.substring(0, 3)}-${selectedDestination.substring(0, 3)}-${Date.now().toString().substring(7)}`;
      
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
      
      // Update tote_register records to track movement centrally
      for (const toteId of toteIds) {
        // First check if the tote exists in the register
        const { data: existingTote } = await supabase
          .from('tote_register')
          .select('*')
          .eq('tote_id', toteId)
          .maybeSingle();
        
        if (existingTote) {
          // Update existing record
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
        } else {
          // Create new record if it doesn't exist (direct outbound without prior inbound)
          const { error: createError } = await supabase
            .from('tote_register')
            .insert({
              tote_id: toteId,
              source_facility: userFacility,
              current_facility: userFacility,
              current_status: 'intransit',
              outbound_timestamp: new Date().toISOString(),
              outbound_operator: localStorage.getItem('username') || 'unknown',
              staged_destination: selectedDestination
            });
            
          if (createError) {
            console.error(`Error creating tote_register for ${toteId}:`, createError);
          }
        }
      }
      
      // Log the consignment creation to audit trail with intransit status
      const { error: logError } = await supabase
        .from('consignment_log')
        .insert({
          consignment_id: newConsignmentId,
          source_facility: userFacility,
          destination_facility: selectedDestination,
          tote_count: toteIds.length,
          status: 'intransit',  // Critical: Set to 'intransit' so it appears for receiving
          created_by: localStorage.getItem('username') || 'unknown'
        });
        
      if (logError) {
        console.error('Error logging consignment:', logError);
      }
      
      setConsignmentId(newConsignmentId);
      setConsignmentStatus('intransit');
      
      toast.success(`Consignment ${newConsignmentId} has been generated for ${toteIds.length} totes`);
      return {
        consignmentId: newConsignmentId,
        status: 'intransit'
      };
    } catch (err: any) {
      console.error('Error generating consignment:', err);
      toast.error(`Failed to generate consignment: ${err.message}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const completeOutbound = async () => {
    if (recentScans.length === 0) {
      toast.warning("No totes have been scanned yet");
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // If there's no consignment yet, generate one
      let currentConsignmentId = consignmentId;
      if (!currentConsignmentId) {
        const result = await generateConsignment();
        if (!result) {
          setIsProcessing(false);
          return false;
        }
        currentConsignmentId = result.consignmentId;
      }
      
      // Mark the consignment as completed but keep status as intransit
      // so it appears in the destination's receive list
      if (currentConsignmentId) {
        const { error: consignmentError } = await supabase
          .from('consignment_log')
          .update({ 
            completed_time: new Date().toISOString(),
            completed_by: localStorage.getItem('username') || 'unknown'
          })
          .eq('consignment_id', currentConsignmentId);
          
        if (consignmentError) {
          console.error('Error updating consignment:', consignmentError);
          toast.error(`Failed to update consignment status: ${consignmentError.message}`);
          setIsProcessing(false);
          return false;
        }
      }
      
      toast.success(`Completed outbound process to ${selectedDestination}`);
      setConsignmentStatus('intransit');
      return true;
    } catch (err: any) {
      console.error('Error completing outbound process:', err);
      toast.error(`Failed to complete outbound: ${err.message}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    consignmentId,
    consignmentStatus,
    isProcessing,
    generateConsignment,
    completeOutbound
  };
};
