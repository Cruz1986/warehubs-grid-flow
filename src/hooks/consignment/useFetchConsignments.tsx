
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ConsignmentLog, Consignment } from '@/types/consignment';

export const useFetchConsignments = (currentFacility: string, isAdmin: boolean = false) => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching consignments for facility: ${currentFacility}, isAdmin: ${isAdmin}`);
      
      // First, check all consignments for debugging
      const { data: allConsignments, error: allConsError } = await supabase
        .from('consignment_log')
        .select('*')
        .order('created_at', { ascending: false });
        
      console.log('All consignments in database:', allConsignments);
      
      if (allConsError) {
        console.error('Error fetching all consignments:', allConsError);
      }
      
      // Then perform the filtered query
      let query = supabase
        .from('consignment_log')
        .select('*');
        
      // Filter by status - include 'created' status as well
      query = query.in('status', ['intransit', 'pending', 'created']);
      
      // Only filter by facility if not admin
      if (!isAdmin) {
        // Convert facility names to lowercase for case-insensitive comparison
        console.log(`Filtering by destination facility: ${currentFacility}`);
        
        // Try a more flexible approach - using ilike with both exact and substring match
        query = query.or(`destination_facility.ilike.${currentFacility},destination_facility.ilike.%${currentFacility}%`);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching consignments:', fetchError);
        setError('Failed to fetch consignments');
        toast.error('Failed to fetch consignments');
        setConsignments([]);
        return;
      }

      console.log('Fetched filtered consignments for facility:', currentFacility, data);
      
      if (!data || data.length === 0) {
        console.log('No consignments found after filtering');
        console.log('Current facility value used for filtering:', currentFacility);
        
        // Additional debug - check for any consignments that might be close matches
        const { data: fuzzyData } = await supabase
          .from('consignment_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        console.log('Latest 5 consignments in system (for debug):', fuzzyData);
        setConsignments([]);
        return;
      }
      
      const mappedConsignments = data.map((log: ConsignmentLog) => ({
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
      
      console.log('Mapped consignments:', mappedConsignments);
      setConsignments(mappedConsignments);
    } catch (err) {
      console.error('Error processing consignments:', err);
      setError('Failed to process consignments');
      toast.error('Failed to process consignments');
      setConsignments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFacility, isAdmin]);

  useEffect(() => {
    console.log('Setting up consignment fetching for facility:', currentFacility);
    fetchConsignments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('consignment-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'consignment_log' 
      }, payload => {
        console.log('Consignment data changed:', payload);
        fetchConsignments();
      })
      .subscribe();
      
    return () => {
      console.log('Cleaning up consignment subscription');
      supabase.removeChannel(channel);
    };
  }, [currentFacility, fetchConsignments]);

  return {
    consignments,
    isLoading,
    error,
    refetchConsignments: fetchConsignments
  };
};
