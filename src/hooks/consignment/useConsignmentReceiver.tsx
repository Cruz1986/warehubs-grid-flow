export const useFetchConsignments = (currentFacility: string, isAdmin: boolean = false) => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0); // Add a counter to track fetch attempts

  const fetchConsignments = useCallback(async () => {
    console.log(`Fetching consignments (attempt ${fetchCount + 1}) for facility:`, currentFacility);
    try {
      setIsLoading(true);
      setError(null);
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      );
      
      const fetchPromise = supabase
        .from('consignment_log')
        .select('*')
        .in('status', ['intransit', 'pending'])
        .order('created_at', { ascending: false });
        
      // Only filter by facility if not admin
      if (!isAdmin) {
        fetchPromise.eq('destination_facility', currentFacility);
      }

      // Race between fetch and timeout
      const result = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as { data: any[], error: any };

      if (result.error) {
        throw result.error;
      }

      console.log('Fetched consignments:', result.data);
      
      const mappedConsignments = (result.data || []).map((log) => ({
        id: log.consignment_id,
        source: log.source_facility,
        destination: log.destination_facility,
        status: log.status,
        toteCount: log.tote_count,
        createdAt: log.created_at || '',
        received_count: log.received_count,
        receivedTime: log.received_time,
        notes: log.notes
      }));
      
      setConsignments(mappedConsignments);
      setFetchCount(prev => prev + 1);
    } catch (err: any) {
      console.error('Error fetching consignments:', err);
      setError(`Failed to fetch consignments: ${err.message || 'Unknown error'}`);
      toast.error('Failed to fetch consignments');
    } finally {
      setIsLoading(false);
    }
  }, [currentFacility, isAdmin, fetchCount]);

  useEffect(() => {
    console.log("useFetchConsignments - Running initial fetch");
    fetchConsignments();
    
    // Set up a more reliable subscription
    const channel = supabase
      .channel('consignment-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'consignment_log',
          filter: !isAdmin ? `destination_facility=eq.${currentFacility}` : undefined
        }, 
        (payload) => {
          console.log('Consignment change detected:', payload);
          fetchConsignments();
        }
      )
      .subscribe((status) => {
        console.log(`Supabase channel status: ${status}`);
      });
      
    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [currentFacility, isAdmin, fetchConsignments]);

  return {
    consignments,
    isLoading,
    error,
    refetchConsignments: fetchConsignments
  };
};