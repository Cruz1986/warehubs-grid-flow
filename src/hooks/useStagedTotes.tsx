import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';
import { toast } from 'sonner';

export const useStagedTotes = () => {
  const [stagedTotes, setStagedTotes] = useState<Tote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStagedTotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: stagedError } = await supabase
      .from('tote_staging')
      .select('*')
      .eq('status', 'staged')
      .order('grid_timestamp', { ascending: false })
      .limit(10);

    if (stagedError) {
      console.error('Error fetching staged totes:', stagedError);
      setError('Failed to fetch staged totes');
      toast.error('Failed to fetch staged totes');
      setIsLoading(false);
      return;
    }

    const formattedStaged = data.map(tote => ({
      id: tote.tote_id || 'Unknown',
      status: 'staged' as const,
      source: tote.staging_facility || 'Unknown',
      destination: tote.destination || 'Unknown',
      timestamp: tote.grid_timestamp ? new Date(tote.grid_timestamp).toISOString() : '',
      user: tote.staging_user || 'Unknown',
      grid: tote.grid_no || 'Unknown',
      currentFacility: tote.staging_facility || 'Unknown',
      stagingTime: tote.staging_time ? new Date(tote.staging_time).toISOString() : undefined
    }));

    setStagedTotes(formattedStaged);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStagedTotes();

    const channel = supabase
      .channel('realtime:tote_staging')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tote_staging'
      }, payload => {
        console.log('Realtime payload received:', payload);
        fetchStagedTotes();
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription successful.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStagedTotes]);

  return {
    stagedTotes,
    isLoading,
    error
  };
};
