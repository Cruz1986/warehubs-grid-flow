
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tote } from '@/components/operations/ToteTable';
import { useToteRegister } from '@/hooks/useToteRegister';

export const useConsignmentActions = (
  recentScans: Tote[], 
  userFacility: string, 
  selectedDestination: string
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateToteConsignment } = useToteRegister();

  const generateConsignmentId = () => {
    // Generate a unique consignment ID based on source, destination, and timestamp
    const timestamp = Date.now().toString(36);
    const source = userFacility.substring(0, 3);
    const destination = selectedDestination.substring(0, 3);
    return `CS-${source}-${destination}-${timestamp}`;
  };

  const generateConsignment = async () => {
    if (recentScans.length === 0) {
      toast.error('No totes have been scanned for the consignment');
      return null;
    }

    setIsProcessing(true);
    
    try {
      const consignmentId = generateConsignmentId();
      const timestamp = new Date().toISOString();
      const username = localStorage.getItem('username') || 'unknown';
      
      // Update tote_outbound with consignment info
      for (const tote of recentScans) {
        const { error: updateError } = await supabase
          .from('tote_outbound')
          .update({ 
            consignment_id: consignmentId,
            status: 'intransit'
          })
          .eq('tote_id', tote.id);
          
        if (updateError) {
          console.error(`Error updating tote ${tote.id} consignment:`, updateError);
        }
        
        // Update tote register with consignment information
        await updateToteConsignment(tote.id, consignmentId, 'intransit');
      }
      
      // Create consignment log entry
      const { error: consignmentError } = await supabase
        .from('consignment_log')
        .insert({
          consignment_id: consignmentId,
          source_facility: userFacility,
          destination_facility: selectedDestination,
          status: 'intransit',
          created_at: timestamp,
          created_by: username,
          tote_count: recentScans.length
        });
        
      if (consignmentError) {
        console.error('Error creating consignment log:', consignmentError);
        toast.error('Failed to create consignment log');
        return null;
      }
      
      toast.success(`Consignment ${consignmentId} created successfully`);
      
      return {
        consignmentId,
        status: 'intransit',
        toteCount: recentScans.length
      };
    } catch (err) {
      console.error('Error generating consignment:', err);
      toast.error('An error occurred while generating the consignment');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const completeOutbound = async (consignmentId?: string) => {
    if (recentScans.length === 0) {
      toast.error('No totes have been scanned for outbound');
      return false;
    }

    setIsProcessing(true);
    
    try {
      const timestamp = new Date().toISOString();
      const username = localStorage.getItem('username') || 'unknown';
      let finalConsignmentId = consignmentId;
      
      // If no consignment ID provided, generate one first
      if (!finalConsignmentId) {
        const result = await generateConsignment();
        if (!result) {
          setIsProcessing(false);
          return false;
        }
        finalConsignmentId = result.consignmentId;
      }
      
      // Update consignment status to completed
      const { error: updateError } = await supabase
        .from('consignment_log')
        .update({ 
          status: 'completed',
          completed_time: timestamp,
          completed_by: username
        })
        .eq('consignment_id', finalConsignmentId);
        
      if (updateError) {
        console.error('Error updating consignment status:', updateError);
        toast.error('Failed to complete consignment process');
        return false;
      }
      
      toast.success(`Outbound process completed successfully. Consignment ID: ${finalConsignmentId}`);
      return true;
    } catch (err) {
      console.error('Error completing outbound process:', err);
      toast.error('An error occurred while completing the outbound process');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchConsignmentDetails = async (selectedConsignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('consignment_log')
        .select('*, tote_count')
        .eq('consignment_id', selectedConsignmentId)
        .single();
        
      if (error) {
        console.error('Error fetching consignment details:', error);
        toast.error('Failed to fetch consignment details');
        return null;
      }
      
      return {
        consignmentId: data.consignment_id,
        status: data.status,
        toteCount: data.tote_count || 0
      };
    } catch (err) {
      console.error('Error fetching consignment details:', err);
      toast.error('Failed to fetch consignment details');
      return null;
    }
  };

  return {
    isProcessing,
    generateConsignment,
    completeOutbound,
    fetchConsignmentDetails
  };
};
