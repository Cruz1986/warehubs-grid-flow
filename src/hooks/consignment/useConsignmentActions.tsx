import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';

export const useConsignmentActions = (
  recentScans: Tote[],
  userFacility: string,
  selectedDestination: string
) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchConsignmentDetails = async (consignmentId: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('consignment_log')
        .select('*')
        .eq('consignment_id', consignmentId)
        .single();
        
      if (error) {
        console.error('Error fetching consignment details:', error);
        toast.error(`Failed to fetch consignment details: ${error.message}`);
        return null;
      }
      
      return {
        consignmentId: data.consignment_id,
        status: data.status,
        toteCount: data.tote_count,
        source: data.source_facility,
        destination: data.destination_facility
      };
    } catch (err: any) {
      console.error('Error fetching consignment details:', err);
      toast.error(`Failed to fetch consignment details: ${err.message}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateConsignment = async () => {
    if (recentScans.length === 0) {
      toast.warning("No totes have been scanned yet");
      return null;
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
      
      // Log the consignment creation to audit trail with intransit status
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
        
      if (logError) {
        console.error('Error logging consignment:', logError);
      }
      
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

  const completeOutbound = async (consignmentId: string | null) => {
    if (recentScans.length === 0) {
      toast.warning("No totes have been scanned yet");
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // If there's no consignment yet, generate one - This makes it automatic
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
    isProcessing,
    generateConsignment,
    completeOutbound,
    fetchConsignmentDetails
  };
};
