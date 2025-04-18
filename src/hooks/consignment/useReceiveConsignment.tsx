import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useToteRegister } from '@/hooks/useToteRegister';

export const useReceiveConsignment = (currentFacility: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateToteRegister } = useToteRegister();

// Add duplicate tote check
const handleReceiveConsignment = async (consignmentId: string) => {
  setIsProcessing(true);
  const timestamp = new Date().toISOString();
  const username = localStorage.getItem('username') || 'unknown';

  try {
    console.log(`Starting to receive consignment: ${consignmentId} at facility: ${currentFacility}`);
    
    // First, get consignment details to verify it exists and is valid
    const { data: consignmentDetails, error: consignmentError } = await supabase
      .from('consignment_log')
      .select('*')
      .eq('consignment_id', consignmentId)
      .eq('destination_facility', currentFacility)
      .in('status', ['intransit', 'pending'])
      .single();
      
    if (consignmentError || !consignmentDetails) {
      console.error('Error fetching consignment details:', consignmentError);
      toast.error('Failed to verify consignment details');
      setIsProcessing(false);
      return null;
    }
    
    console.log('Found consignment details:', consignmentDetails);

    const { data: toteData, error: toteError } = await supabase
      .from('tote_outbound')
      .select('tote_id')
      .eq('consignment_id', consignmentId);
      
    if (toteError) {
      console.error('Error fetching totes for consignment:', toteError);
      toast.error('Failed to fetch totes for consignment');
      setIsProcessing(false);
      return null;
    }
    
    // Check for duplicate totes in the data
    const toteIds = toteData.map(tote => tote.tote_id);
    const uniqueToteIds = [...new Set(toteIds)];
    
    if (toteIds.length !== uniqueToteIds.length) {
      console.warn(`Found ${toteIds.length - uniqueToteIds.length} duplicate totes in consignment ${consignmentId}`);
    }
    
    console.log(`Processing ${uniqueToteIds.length} unique totes for consignment ${consignmentId}`);
    
    const { data: consignmentData } = await supabase
      .from('consignment_log')
      .select('source_facility')
      .eq('consignment_id', consignmentId)
      .single();
      
    const sourceFacility = consignmentData?.source_facility || 'Unknown';
    
    // Use the unique tote IDs to prevent processing duplicates
    for (const toteId of uniqueToteIds) {
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
    
    // Update the consignment status
    const { error, data } = await supabase
      .from('consignment_log')
      .update({
        status: 'received',
        received_time: timestamp,
        received_by: username,
        received_count: uniqueToteIds.length,
        notes: uniqueToteIds.length !== consignmentDetails.tote_count ? 
          `Discrepancy detected: Expected ${consignmentDetails.tote_count} totes, received ${uniqueToteIds.length}` : 
          null
      })
      .eq('consignment_id', consignmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating consignment status:', error);
      toast.error('Failed to update consignment status');
      setIsProcessing(false);
      return null;
    }

    toast.success(`Consignment ${consignmentId} with ${uniqueToteIds.length} totes has been received`);
    return data;
  } catch (err) {
    console.error('Error receiving consignment:', err);
    toast.error('Failed to receive consignment');
    return null;
  } finally {
    setIsProcessing(false);
  }
};

  return {
    handleReceiveConsignment,
    isProcessing
  };
};
