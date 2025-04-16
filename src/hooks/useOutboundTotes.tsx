
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';
import { toast } from 'sonner';

export const useOutboundTotes = () => {
  const [outboundTotes, setOutboundTotes] = useState<Tote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutboundTotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch Outbound Totes
        const { data: outboundData, error: outboundError } = await supabase
          .from('tote_outbound')
          .select('*')
          .eq('status', 'completed')
          .order('completed_time', { ascending: false })
          .limit(10);
        
        if (outboundError) {
          console.error('Error fetching outbound totes:', outboundError);
          setError('Failed to fetch outbound totes');
          toast.error('Failed to fetch outbound totes');
          return;
        }
        
        const formattedOutbound = outboundData.map(tote => ({
          id: tote.tote_id,
          status: 'completed' as const,
          source: 'Current Facility',
          destination: tote.destination || 'Unknown',
          timestamp: new Date(tote.completed_time || tote.timestamp_out).toLocaleString(),
          user: tote.completed_by || tote.operator_name || 'Unknown',
          grid: undefined,
          currentFacility: tote.destination || 'Unknown',
          completedTime: tote.completed_time ? new Date(tote.completed_time).toLocaleString() : undefined
        }));
        setOutboundTotes(formattedOutbound);
      } catch (error: any) {
        console.error('Error fetching outbound totes data:', error);
        setError(`Error fetching outbound tote data: ${error.message}`);
        toast.error('Failed to load outbound tote data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOutboundTotes();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('tote-outbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_outbound' }, payload => {
        console.log('Outbound tote change detected:', payload);
        fetchOutboundTotes();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    outboundTotes,
    isLoading,
    error
  };
};
