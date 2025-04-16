
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';
import { toast } from 'sonner';

export const useStagedTotes = () => {
  const [stagedTotes, setStagedTotes] = useState<Tote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStagedTotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
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
          return;
        }
        
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
      } catch (error: any) {
        console.error('Error fetching staged totes data:', error);
        setError(`Error fetching staged tote data: ${error.message}`);
        toast.error('Failed to load staged tote data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStagedTotes();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('tote-staging-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_staging' }, payload => {
        console.log('Staged tote change detected:', payload);
        fetchStagedTotes();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stagedTotes,
    isLoading,
    error
  };
};
