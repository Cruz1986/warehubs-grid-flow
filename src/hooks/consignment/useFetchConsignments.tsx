
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ConsignmentLog, Consignment } from '@/types/consignment';

export const useFetchConsignments = (currentFacility: string, isAdmin: boolean = false) => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Debounced fetch to avoid excessive refreshes
  const debouncedFetch = useCallback(
    // Add debounce logic with setTimeout
    debounce(async () => {
      await fetchConsignments();
    }, 500),
    [currentFacility, isAdmin]
  );

  const fetchConsignments = useCallback(async () => {
    if (Date.now() - lastUpdated.getTime() < 2000) {
      // Skip if last update was less than 2 seconds ago to prevent rapid fetching
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('consignment_log')
        .select('*')
        .in('status', ['intransit', 'pending'])
        .order('created_at', { ascending: false });
        
      // Only filter by facility if not admin
      if (!isAdmin) {
        query = query.eq('destination_facility', currentFacility);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching consignments:', error);
        setError('Failed to fetch consignments');
        toast.error('Failed to fetch consignments');
        return;
      }

      console.log('Fetched consignments for facility:', currentFacility, data);
      
      const mappedConsignments = (data || []).map((log: ConsignmentLog) => ({
        id: log.consignment_id,
        source: log.source_facility,
        destination: log.destination_facility,
        status: log.status,
        toteCount: log.tote_count,
        createdAt: log.created_at || '',
        receivedCount: log.received_count,
        receivedTime: log.received_time,
        notes: log.notes
      }));
      
      setConsignments(mappedConsignments);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error processing consignments:', err);
      setError('Failed to process consignments');
      toast.error('Failed to process consignments');
    } finally {
      setIsLoading(false);
    }
  }, [currentFacility, isAdmin, lastUpdated]);

  useEffect(() => {
    fetchConsignments();
    
    // Use a more careful approach with the real-time subscription
    const channel = supabase
      .channel('consignment-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'consignment_log',
        filter: isAdmin ? undefined : `destination_facility=eq.${currentFacility}`
      }, payload => {
        // Only trigger refresh on relevant changes
        console.log('Consignment data changed:', payload);
        debouncedFetch();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentFacility, fetchConsignments, isAdmin, debouncedFetch]);

  return {
    consignments,
    isLoading,
    error,
    refetchConsignments: fetchConsignments
  };
};

// Simple debounce function
function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(...args: any[]) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}
