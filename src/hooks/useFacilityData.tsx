
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActivityData {
  [key: string]: number;
}

export const useFacilityData = () => {
  const [facilityData, setFacilityData] = useState<ActivityData>({
    'Inbound': 0,
    'Staged': 0,
    'Outbound': 0,
    'Pending': 0,
  });
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setIsLoadingActivity(true);
        
        console.log('Fetching facility data...');
        
        const { data: inboundCount, error: inboundError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'inbound')
          .single();
          
        const { data: outboundCount, error: outboundError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'outbound')
          .single();
          
        const { data: gridCount, error: gridError } = await supabase
          .from('grids')
          .select('count')
          .eq('status', 'occupied')
          .single();
          
        const { data: pendingCount, error: pendingError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'pending')
          .single();
        
        if (inboundError || outboundError || gridError || pendingError) {
          console.error('Error fetching activity counts:', { inboundError, outboundError, gridError, pendingError });
          if (inboundError) toast.error('Failed to load inbound data');
          if (outboundError) toast.error('Failed to load outbound data');
          if (gridError) toast.error('Failed to load grid data');
          if (pendingError) toast.error('Failed to load pending data');
        } else {
          console.log('Activity data fetched:', { inboundCount, outboundCount, gridCount, pendingCount });
          setFacilityData({
            'Inbound': parseInt(String(inboundCount?.count || '0')),
            'Staged': parseInt(String(gridCount?.count || '0')),
            'Outbound': parseInt(String(outboundCount?.count || '0')),
            'Pending': parseInt(String(pendingCount?.count || '0')),
          });
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        toast.error('Failed to load activity data');
      } finally {
        setIsLoadingActivity(false);
      }
    };
    
    fetchActivityData();
    
    const channel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchActivityData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    facilityData,
    isLoadingActivity
  };
};
