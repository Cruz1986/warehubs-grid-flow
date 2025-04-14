
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
          console.error('Error fetching activity counts');
        } else {
          setFacilityData({
            'Inbound': parseInt(inboundCount?.count || '0'),
            'Staged': parseInt(gridCount?.count || '0'),
            'Outbound': parseInt(outboundCount?.count || '0'),
            'Pending': parseInt(pendingCount?.count || '0'),
          });
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
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
