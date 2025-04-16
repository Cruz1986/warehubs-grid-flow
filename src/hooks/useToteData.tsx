
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';
import { toast } from 'sonner';

export const useToteData = () => {
  const [inboundTotes, setInboundTotes] = useState<Tote[]>([]);
  const [stagedTotes, setStagedTotes] = useState<Tote[]>([]);
  const [outboundTotes, setOutboundTotes] = useState<Tote[]>([]);
  const [isLoadingTotes, setIsLoadingTotes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotes = async () => {
      try {
        setIsLoadingTotes(true);
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
        } else {
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
        }
        
        // Fetch Staged Totes
        const { data: stagedData, error: stagedError } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('status', 'staged')
          .order('grid_timestamp', { ascending: false })
          .limit(10);
        
        if (stagedError) {
          console.error('Error fetching staged totes:', stagedError);
          setError('Failed to fetch staged totes');
          toast.error('Failed to fetch staged totes');
        } else {
          const formattedStaged = stagedData.map(tote => ({
            id: tote.tote_id || 'Unknown',
            status: 'staged' as const,
            source: tote.staging_facility || 'Current Facility',
            destination: tote.destination || 'Unknown',
            timestamp: new Date(tote.grid_timestamp).toLocaleString(),
            user: tote.staging_user || 'Unknown',
            grid: tote.grid_no,
            currentFacility: tote.staging_facility || 'Unknown',
            stagingTime: tote.staging_time ? new Date(tote.staging_time).toLocaleString() : undefined
          }));
          setStagedTotes(formattedStaged);
        }
        
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
        } else {
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
        }
      } catch (error: any) {
        console.error('Error fetching totes data:', error);
        setError(`Error fetching tote data: ${error.message}`);
        toast.error('Failed to load tote data');
      } finally {
        setIsLoadingTotes(false);
      }
    };
    
    fetchTotes();
    
    // Set up realtime subscriptions
    const channels = [
      supabase
        .channel('tote-inbound-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_inbound' }, payload => {
          console.log('Inbound tote change detected:', payload);
          fetchTotes();
        })
        .subscribe(),
      
      supabase
        .channel('tote-staging-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_staging' }, payload => {
          console.log('Staged tote change detected:', payload);
          fetchTotes();
        })
        .subscribe(),
      
      supabase
        .channel('tote-outbound-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_outbound' }, payload => {
          console.log('Outbound tote change detected:', payload);
          fetchTotes();
        })
        .subscribe()
    ];
    
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  return {
    inboundTotes,
    stagedTotes,
    outboundTotes,
    isLoadingTotes,
    error
  };
};
