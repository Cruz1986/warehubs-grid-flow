
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ConsignmentLog, Consignment } from '@/types/consignment';

export const useFetchConsignments = (currentFacility: string, isAdmin: boolean = false) => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Define debounce function
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return function(...args: any[]) {
      const context = this;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(context, args);
      }, wait);
    };
  }, []);

  // Debounced fetch to avoid excessive refreshes
  const debouncedFetch = useCallback(
    debounce(async () => {
      await fetchConsignments();
    }, 500),
    [currentFacility, isAdmin]
  );

  const fetchConsignments = useCallback(async () => {
    if (!currentFacility) {
      console.error("No facility provided to fetch consignments");
      setError("No facility selected");
      setIsLoading(false);
      return;
    }
    
    if (Date.now() - lastUpdated.getTime() < 2000) {
      // Skip if last update was less than 2 seconds ago to prevent rapid fetching
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching consignments for ${currentFacility}, isAdmin: ${isAdmin}`);
      
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
        setIsLoading(false);
        return;
      }

      console.log('Fetched consignments:', data);
      
      if (!data || data.length === 0) {
        console.log('No consignments found');
        setConsignments([]);
        setIsLoading(false);
        setLastUpdated(new Date());
        return;
      }
      
      const mappedConsignments = data.map((log: ConsignmentLog) => ({
        id: log.consignment_id,
        source: log.source_facility,
        destination: log.destination_facility,
        status: log.status,
        toteCount: log.tote_count || 0,
        createdAt: log.created_at || '',
        receivedCount: log.received_count || 0,
        receivedTime: log.received_time || '',
        notes: log.notes || ''
      }));
      
      console.log('Mapped consignments:', mappedConsignments);
      setConsignments(mappedConsignments);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error processing consignments:', err);
      setError('Failed to process consignments');
    } finally {
      setIsLoading(false);
    }
  }, [currentFacility, isAdmin, lastUpdated]);

  useEffect(() => {
    console.log('Setting up consignment fetching for facility:', currentFacility);
    
    // Initial fetch
    fetchConsignments();
    
    // Set up realtime subscription with debounce protection
    const channel = supabase
      .channel('consignment-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'consignment_log',
        filter: isAdmin ? undefined : `destination_facility=eq.${currentFacility}`
      }, () => {
        // Only trigger the debouncedFetch, not direct fetch
        debouncedFetch();
      })
      .subscribe();
      
    return () => {
      console.log('Cleaning up consignment subscription');
      supabase.removeChannel(channel);
    };
  }, [currentFacility, isAdmin, debouncedFetch]);

  return {
    consignments,
    isLoading,
    error,
    refetchConsignments: fetchConsignments
  };
};
