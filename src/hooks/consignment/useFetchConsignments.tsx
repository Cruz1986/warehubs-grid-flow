
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ConsignmentLog } from '@/types/consignment';

export const useFetchConsignments = (currentFacility: string) => {
  const [consignments, setConsignments] = useState<ConsignmentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsignments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('consignment_log')
        .select('*')
        .eq('destination_facility', currentFacility)
        .in('status', ['intransit', 'pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching consignments:', error);
        setError('Failed to fetch consignments');
        toast.error('Failed to fetch consignments');
        return;
      }

      console.log('Fetched consignments for facility:', currentFacility, data);
      setConsignments(data || []);
    } catch (err) {
      console.error('Error processing consignments:', err);
      setError('Failed to process consignments');
      toast.error('Failed to process consignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsignments();
    
    const channel = supabase
      .channel('consignment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consignment_log' }, payload => {
        console.log('Consignment data changed:', payload);
        fetchConsignments();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentFacility]);

  return {
    consignments,
    isLoading,
    error,
    fetchConsignments
  };
};
