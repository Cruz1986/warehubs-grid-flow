
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useToteRegister } from '@/hooks/useToteRegister';

export const useReceiveConsignment = (currentFacility: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateToteRegister } = useToteRegister();

  const handleReceiveConsignment = async (consignmentId: string) => {
    setIsProcessing(true);
    const timestamp = new Date().toISOString();
    const username = localStorage.getItem('username') || 'unknown';

    try {
      const { data: toteData, error: toteError } = await supabase
        .from('tote_outbound')
        .select('tote_id')
        .eq('consignment_id', consignmentId);
        
      if (toteError) {
        console.error('Error fetching totes for consignment:', toteError);
        toast.error('Failed to fetch totes for consignment');
        return;
      }
      
      const toteIds = toteData.map(tote => tote.tote_id);
      console.log(`Processing ${toteIds.length} totes for consignment ${consignmentId}`);
      
      const { data: consignmentData } = await supabase
        .from('consignment_log')
        .select('source_facility')
        .eq('consignment_id', consignmentId)
        .single();
        
      const sourceFacility = consignmentData?.source_facility || 'Unknown';
      
      for (const toteId of toteIds) {
        const { data: existingInbound } = await supabase
          .from('tote_inbound')
          .select('*')
          .eq('tote_id', toteId)
          .eq('current_facility', currentFacility)
          .eq('status', 'inbound')
          .maybeSingle();
        
        if (!existingInbound) {
          const { error: inboundError } = await supabase
            .from('tote_inbound')
            .insert({
              tote_id: toteId,
              source: sourceFacility,
              current_facility: currentFacility,
              operator_name: username,
              timestamp_in: timestamp,
              consignment_id: consignmentId
            });
            
          if (inboundError) {
            console.error(`Error creating inbound record for tote ${toteId}:`, inboundError);
          }
          
          await updateToteRegister(toteId, {
            current_status: 'inbound',
            current_facility: currentFacility,
            ib_timestamp: timestamp,
            received_by: username
          });
        } else {
          console.log(`Tote ${toteId} already exists in inbound at ${currentFacility}, skipping insert`);
        }
      }
      
      const { error } = await supabase
        .from('consignment_log')
        .update({
          status: 'received',
          received_time: timestamp,
          received_by: username,
          received_count: toteIds.length
        })
        .eq('consignment_id', consignmentId);

      if (error) {
        console.error('Error updating consignment status:', error);
        toast.error('Failed to update consignment status');
        return;
      }

      toast.success(`Consignment ${consignmentId} with ${toteIds.length} totes has been received`);
    } catch (err) {
      console.error('Error receiving consignment:', err);
      toast.error('Failed to receive consignment');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleReceiveConsignment,
    isProcessing
  };
};
