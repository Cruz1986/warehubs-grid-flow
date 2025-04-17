
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';
import { toast } from 'sonner';

export const useOutboundTotes = () => {
  const [outboundTotes, setOutboundTotes] = useState<Tote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutboundTotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Query to get more detailed outbound information
        const { data: outboundData, error: outboundError } = await supabase
          .from('tote_outbound')
          .select('*, consignment_id')
          .order('timestamp_out', { ascending: false })
          .limit(10);
        
        if (outboundError) {
          console.error('Error fetching outbound totes:', outboundError);
          setError('Failed to fetch outbound totes');
          toast.error('Failed to fetch outbound totes');
          return;
        }
        
        console.log('Outbound data fetched:', outboundData);
        
        // Fetch original source information from inbound and staging tables
        const formattedOutbound = await Promise.all(outboundData.map(async (tote) => {
          // Variables to store source and grid
          let source = "Unknown";
          let grid = undefined;
          let currentFacility = "Unknown";
          let consignmentStatus = tote.status === 'intransit' ? 'In Transit' : 'Completed';
          
          try {
            // First check inbound table for original source
            const { data: inboundData } = await supabase
              .from('tote_inbound')
              .select('source, current_facility')
              .eq('tote_id', tote.tote_id)
              .maybeSingle();
              
            if (inboundData) {
              // Get original source from inbound table
              source = inboundData.source || "Unknown";
              // Current facility may have changed since inbound
              currentFacility = inboundData.current_facility || "Unknown";
            }
            
            // Then check staging for grid information
            const { data: stagingData } = await supabase
              .from('tote_staging')
              .select('grid_no, staging_facility')
              .eq('tote_id', tote.tote_id)
              .maybeSingle();
              
            if (stagingData) {
              grid = stagingData.grid_no;
              // Update current facility with staging facility if available
              currentFacility = stagingData.staging_facility || currentFacility;
            }

            // Also check tote_register for most up-to-date status
            const { data: registerData } = await supabase
              .from('tote_register')
              .select('current_status, current_facility')
              .eq('tote_id', tote.tote_id)
              .maybeSingle();

            if (registerData) {
              // Update with the most current status from register
              currentFacility = registerData.current_facility || currentFacility;
              consignmentStatus = registerData.current_status === 'intransit' ? 'In Transit' : 
                                 (registerData.current_status === 'delivered' ? 'Delivered' : consignmentStatus);
            }
          } catch (error) {
            console.error(`Error fetching data for tote ${tote.tote_id}:`, error);
          }
          
          return {
            id: tote.tote_id,
            status: (tote.status === 'intransit' ? 'intransit' : 'outbound') as any,
            source: source, // Original source from inbound
            destination: tote.destination || 'Unknown',
            timestamp: new Date(tote.timestamp_out || Date.now()).toISOString(),
            user: tote.operator_name || 'Unknown',
            grid: grid,
            currentFacility: currentFacility, // Current facility where the tote is now
            completedTime: tote.completed_time ? new Date(tote.completed_time).toISOString() : undefined,
            consignmentId: tote.consignment_id || undefined,
            consignmentStatus: consignmentStatus
          };
        }));
        
        setOutboundTotes(formattedOutbound);
      } catch (error: any) {
        console.error('Error fetching outbound totes data:', error);
        setError(`Error fetching outbound tote data: ${error.message}`);
        toast.error('Failed to load outbound tote data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOutboundTotes();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('tote-outbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_outbound' }, payload => {
        console.log('Outbound tote change detected:', payload);
        fetchOutboundTotes();
      })
      .subscribe();
    
    // Also subscribe to tote_register changes to catch status updates
    const registerChannel = supabase
      .channel('tote-register-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_register' }, payload => {
        console.log('Tote register change detected:', payload);
        fetchOutboundTotes();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(registerChannel);
    };
  }, []);

  return {
    outboundTotes,
    isLoading,
    error
  };
};
