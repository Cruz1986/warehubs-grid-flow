
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';
import { toast } from 'sonner';

export const useInboundTotes = () => {
  const [inboundTotes, setInboundTotes] = useState<Tote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInboundTotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch Inbound Totes
        const { data: inboundData, error: inboundError } = await supabase
          .from('tote_inbound')
          .select('*')
          .eq('status', 'inbound')
          .order('timestamp_in', { ascending: false })
          .limit(10);
        
        if (inboundError) {
          console.error('Error fetching inbound totes:', inboundError);
          setError('Failed to fetch inbound totes');
          toast.error('Failed to fetch inbound totes');
          return;
        }
        
        const formattedInbound = inboundData.map(tote => ({
          id: tote.tote_id,
          status: 'inbound' as const,
          source: tote.source || 'Unknown',
          destination: tote.current_facility || 'Current Facility',
          timestamp: new Date(tote.timestamp_in).toLocaleString(),
          user: tote.operator_name || 'Unknown',
          grid: undefined,
          currentFacility: tote.current_facility || 'Unknown'
        }));
        setInboundTotes(formattedInbound);
      } catch (error: any) {
        console.error('Error fetching inbound totes data:', error);
        setError(`Error fetching inbound tote data: ${error.message}`);
        toast.error('Failed to load inbound tote data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInboundTotes();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('tote-inbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_inbound' }, payload => {
        console.log('Inbound tote change detected:', payload);
        fetchInboundTotes();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    inboundTotes,
    isLoading,
    error
  };
};
