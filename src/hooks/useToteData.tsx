
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';

export const useInboundTotes = () => {
  const [inboundTotes, setInboundTotes] = useState<Tote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInboundTotes = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('tote_inbound')
          .select('*, users(Username)')
          .eq('status', 'inbound')
          .order('timestamp_in', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Error fetching inbound totes:', error);
        } else {
          const formattedInbound = data.map(tote => ({
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
      } catch (error) {
        console.error('Error fetching inbound totes data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInboundTotes();
    
    const inboundChannel = supabase
      .channel('tote-inbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_inbound' }, () => {
        fetchInboundTotes();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(inboundChannel);
    };
  }, []);

  return { inboundTotes, isLoading };
};

export const useStagedTotes = () => {
  const [stagedTotes, setStagedTotes] = useState<Tote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStagedTotes = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('status', 'staged')
          .order('grid_timestamp', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Error fetching staged totes:', error);
        } else {
          const formattedStaged = data.map(tote => ({
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
      } catch (error) {
        console.error('Error fetching staged totes data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStagedTotes();
    
    const stagingChannel = supabase
      .channel('tote-staging-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_staging' }, () => {
        fetchStagedTotes();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(stagingChannel);
    };
  }, []);

  return { stagedTotes, isLoading };
};

export const useOutboundTotes = () => {
  const [outboundTotes, setOutboundTotes] = useState<Tote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOutboundTotes = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('tote_outbound')
          .select('*')
          .eq('status', 'outbound')
          .order('timestamp_out', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Error fetching outbound totes:', error);
        } else {
          const formattedOutbound = data.map(tote => ({
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
        console.error('Error fetching outbound totes data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOutboundTotes();
    
    const outboundChannel = supabase
      .channel('tote-outbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_outbound' }, () => {
        fetchOutboundTotes();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(outboundChannel);
    };
  }, []);

  return { outboundTotes, isLoading };
};
