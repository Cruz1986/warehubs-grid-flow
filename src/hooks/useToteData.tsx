
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
        
        // Fetch Inbound Totes with new fields
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
            destination: tote.current_facility || 'Current Facility',
            timestamp: new Date(tote.timestamp_in).toLocaleString(),
            user: tote.operator_name || 'Unknown',
            grid: undefined,
            currentFacility: tote.current_facility || 'Unknown'
          }));
          setInboundTotes(formattedInbound);
        }
        
        // Fetch Staged Totes with new fields
        const { data: stagedData, error: stagedError } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('status', 'staged')
          .order('staging_time', { ascending: false })
          .limit(10);
        
        if (stagedError) {
          console.error('Error fetching staged totes:', stagedError);
        } else {
          const formattedStaged = stagedData.map(tote => ({
            id: tote.tote_id || 'Unknown',
            status: 'staged' as const,
            source: tote.staging_facility || 'Current Facility',
            destination: tote.destination || 'Unknown',
            timestamp: new Date(tote.staging_time).toLocaleString(),
            user: tote.staging_user || 'Unknown',
            grid: tote.grid_no,
            currentFacility: tote.staging_facility || 'Unknown'
          }));
          setStagedTotes(formattedStaged);
        }
        
        // Fetch Outbound Totes with new completion fields
        const { data: outboundData, error: outboundError } = await supabase
          .from('tote_outbound')
          .select('*')
          .eq('status', 'completed')
          .order('completed_time', { ascending: false })
          .limit(10);
        
        if (outboundError) {
          console.error('Error fetching outbound totes:', outboundError);
        } else {
          const formattedOutbound = outboundData.map(tote => ({
            id: tote.tote_id,
            status: 'outbound' as const,
            source: 'Current Facility',
            destination: tote.destination || 'Unknown',
            timestamp: new Date(tote.completed_time).toLocaleString(),
            user: tote.completed_by || 'Unknown',
            grid: undefined,
            currentFacility: tote.destination || 'Unknown'
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
    
    // Realtime subscriptions for each table
    const channels = [
      supabase
        .channel('tote-inbound-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_inbound' }, fetchTotes)
        .subscribe(),
      
      supabase
        .channel('tote-staging-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_staging' }, fetchTotes)
        .subscribe(),
      
      supabase
        .channel('tote-outbound-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_outbound' }, fetchTotes)
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
    isLoadingTotes
  };
};
