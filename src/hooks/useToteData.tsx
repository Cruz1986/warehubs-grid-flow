
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';

export const useToteData = () => {
  const [inboundTotes, setInboundTotes] = useState<Tote[]>([]);
  const [stagedTotes, setStagedTotes] = useState<Tote[]>([]);
  const [outboundTotes, setOutboundTotes] = useState<Tote[]>([]);
  const [isLoadingTotes, setIsLoadingTotes] = useState(true);

  useEffect(() => {
    const fetchTotes = async () => {
      try {
        setIsLoadingTotes(true);
        
        const { data: inboundData, error: inboundError } = await supabase
          .from('tote_inbound')
          .select('*')
          .eq('status', 'inbound')
          .order('timestamp_in', { ascending: false })
          .limit(10);
        
        if (inboundError) {
          console.error('Error fetching inbound totes:', inboundError);
        } else {
          const formattedInbound = inboundData.map(tote => ({
            id: tote.tote_id,
            status: 'inbound' as const,
            source: tote.source || 'Unknown',
            destination: 'Current Facility',
            timestamp: new Date(tote.timestamp_in).toLocaleString(),
            user: tote.operator_name || 'Unknown',
            grid: undefined,
          }));
          setInboundTotes(formattedInbound);
        }
        
        const { data: stagedData, error: stagedError } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('status', 'staged')
          .order('grid_timestamp', { ascending: false })
          .limit(10);
        
        if (stagedError) {
          console.error('Error fetching staged totes:', stagedError);
        } else {
          const formattedStaged = stagedData.map(tote => ({
            id: tote.tote_id || 'Unknown',
            status: 'staged' as const,
            source: 'Current Facility',
            destination: tote.destination || 'Unknown',
            timestamp: new Date(tote.grid_timestamp).toLocaleString(),
            user: tote.operator_name || 'Unknown',
            grid: tote.grid_no,
          }));
          setStagedTotes(formattedStaged);
        }
        
        const { data: outboundData, error: outboundError } = await supabase
          .from('tote_outbound')
          .select('*')
          .eq('status', 'outbound')
          .order('timestamp_out', { ascending: false })
          .limit(10);
        
        if (outboundError) {
          console.error('Error fetching outbound totes:', outboundError);
        } else {
          const formattedOutbound = outboundData.map(tote => ({
            id: tote.tote_id,
            status: 'outbound' as const,
            source: 'Current Facility',
            destination: tote.destination || 'Unknown',
            timestamp: new Date(tote.timestamp_out).toLocaleString(),
            user: tote.operator_name || 'Unknown',
            grid: undefined,
          }));
          setOutboundTotes(formattedOutbound);
        }
      } catch (error) {
        console.error('Error fetching totes data:', error);
      } finally {
        setIsLoadingTotes(false);
      }
    };
    
    fetchTotes();
    
    const inboundChannel = supabase
      .channel('tote-inbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_inbound' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    const stagingChannel = supabase
      .channel('tote-staging-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_staging' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    const outboundChannel = supabase
      .channel('tote-outbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_outbound' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(inboundChannel);
      supabase.removeChannel(stagingChannel);
      supabase.removeChannel(outboundChannel);
    };
  }, []);

  return {
    inboundTotes,
    stagedTotes,
    outboundTotes,
    isLoadingTotes
  };
};
