
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityData {
  [key: string]: number;
}

export const useActivityData = () => {
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
          .from('tote_inbound')
          .select('count')
          .eq('status', 'inbound')
          .single();
          
        const { data: outboundCount, error: outboundError } = await supabase
          .from('tote_outbound')
          .select('count')
          .eq('status', 'outbound')
          .single();
          
        const { data: stagingCount, error: stagingError } = await supabase
          .from('tote_staging')
          .select('count')
          .eq('status', 'staged')
          .single();
          
        const { data: pendingCount, error: pendingError } = await supabase
          .from('tote_inbound')
          .select('count')
          .eq('status', 'pending')
          .single();
        
        if (inboundError || outboundError || stagingError || pendingError) {
          console.error('Error fetching activity counts');
        } else {
          setFacilityData({
            'Inbound': Number(inboundCount?.count ?? 0),
            'Staged': Number(stagingCount?.count ?? 0),
            'Outbound': Number(outboundCount?.count ?? 0),
            'Pending': Number(pendingCount?.count ?? 0),
          });
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setIsLoadingActivity(false);
      }
    };
    
    fetchActivityData();
    
    const activityChannel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchActivityData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(activityChannel);
    };
  }, []);

  return {
    facilityData,
    isLoadingActivity
  };
};
