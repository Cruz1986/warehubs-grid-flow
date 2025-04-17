
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ConsignmentLog } from '@/types/consignment';
import { useToteRegister } from '@/hooks/useToteRegister';

export interface Consignment {
  id: string;
  source: string;
  destination: string;
  status: string;
  toteCount: number;
  createdAt: string;
  receivedCount?: number;
  receivedTime?: string;
  notes?: string;
}

export const useConsignmentReceiver = (currentFacility: string) => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateToteRegister } = useToteRegister();

  const fetchConsignments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('consignment_log')
        .select('*')
        .eq('destination_facility', currentFacility)
        .in('status', ['intransit', 'pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching consignments:', error);
        setError('Failed to fetch consignments');
        toast.error('Failed to fetch consignments');
        return;
      }

      console.log('Fetched consignments for facility:', currentFacility, data);
      const consignmentData = data as ConsignmentLog[] || [];

      const formattedConsignments: Consignment[] = consignmentData.map(consignment => ({
        id: consignment.consignment_id,
        source: consignment.source_facility,
        destination: consignment.destination_facility,
        status: consignment.status,
        toteCount: consignment.tote_count,
        createdAt: consignment.created_at || 'Unknown',
        receivedCount: consignment.received_count,
        receivedTime: consignment.received_time,
        notes: consignment.notes,
      }));

      setConsignments(formattedConsignments);
    } catch (err) {
      console.error('Error processing consignments:', err);
      setError('Failed to process consignments');
      toast.error('Failed to process consignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsignments();
    
    const channel = supabase
      .channel('consignment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consignment_log' }, payload => {
        console.log('Consignment data changed:', payload);
        fetchConsignments();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentFacility]);

  const handleReceiveConsignment = async (consignmentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: toteData, error: toteError } = await supabase
        .from('tote_outbound')
        .select('tote_id')
        .eq('consignment_id', consignmentId);
        
      if (toteError) {
        console.error('Error fetching totes for consignment:', toteError);
        setError('Failed to fetch totes for consignment');
        toast.error('Failed to fetch totes for consignment');
        return;
      }
      
      const toteIds = toteData.map(tote => tote.tote_id);
      console.log(`Processing ${toteIds.length} totes for consignment ${consignmentId}`);
      
      const username = localStorage.getItem('username') || 'unknown';
      const timestamp = new Date().toISOString();
      
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
        setError('Failed to update consignment status');
        toast.error('Failed to update consignment status');
        return;
      }

      toast.success(`Consignment ${consignmentId} with ${toteIds.length} totes has been received`);
      
      setConsignments(prevConsignments => 
        prevConsignments.filter(consignment => consignment.id !== consignmentId)
      );
    } catch (err) {
      console.error('Error receiving consignment:', err);
      setError('Failed to receive consignment');
      toast.error('Failed to receive consignment');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    consignments,
    isLoading,
    error,
    handleReceiveConsignment,
    formatDate
  };
};
