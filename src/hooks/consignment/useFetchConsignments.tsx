
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
      console.log('Fetching all consignments');
      
      let query = supabase
        .from('consignment_log')
        .select('*')
        .in('status', ['intransit', 'pending', 'created']);

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching consignments:', fetchError);
        setError('Failed to fetch consignments');
        toast.error('Failed to fetch consignments');
        setConsignments([]);
        return;
      }

      console.log('Fetched consignments:', data);
      
      if (!data || data.length === 0) {
        console.log('No consignments found');
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
  }, []);  // Removed currentFacility and isAdmin from dependencies since we're showing all

  useEffect(() => {
    console.log('Setting up consignment fetching');
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
  }, [fetchConsignments]);

  return {
    consignments,
    isLoading,
    error,
    refetchConsignments: fetchConsignments
  };
};
