
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '../components/operations/ToteTable';

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
          .from('totes')
          .select('*, users(username)')
          .eq('status', 'inbound')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (inboundError) {
          console.error('Error fetching inbound totes:', inboundError);
        } else {
          const formattedInbound = inboundData.map(tote => ({
            id: tote.tote_number,
            status: 'inbound' as const,
            source: tote.facility_id || 'Unknown',
            destination: 'Current Facility',
            timestamp: new Date(tote.created_at).toLocaleString(),
            user: tote.users?.username || 'Unknown',
            grid: undefined,
          }));
          setInboundTotes(formattedInbound);
        }
        
        const { data: stagedData, error: stagedError } = await supabase
          .from('grids')
          .select('*, totes(*, users(username))')
          .eq('status', 'occupied')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (stagedError) {
          console.error('Error fetching staged totes:', stagedError);
        } else {
          const formattedStaged = stagedData.filter(grid => grid.totes).map(grid => ({
            id: grid.totes?.tote_number || 'Unknown',
            status: 'staged' as const,
            source: grid.totes?.facility_id || 'Unknown',
            destination: grid.destination || 'Unknown',
            timestamp: new Date(grid.created_at).toLocaleString(),
            user: grid.totes?.users?.username || 'Unknown',
            grid: grid.grid_number,
          }));
          setStagedTotes(formattedStaged);
        }
        
        const { data: outboundData, error: outboundError } = await supabase
          .from('totes')
          .select('*, users(username)')
          .eq('status', 'outbound')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (outboundError) {
          console.error('Error fetching outbound totes:', outboundError);
        } else {
          const formattedOutbound = outboundData.map(tote => ({
            id: tote.tote_number,
            status: 'outbound' as const,
            source: 'Current Facility',
            destination: tote.facility_id || 'Unknown',
            timestamp: new Date(tote.created_at).toLocaleString(),
            user: tote.users?.username || 'Unknown',
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
    
    const channel = supabase
      .channel('totes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'totes' }, () => {
        fetchTotes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grids' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    inboundTotes,
    stagedTotes,
    outboundTotes,
    isLoadingTotes
  };
};
