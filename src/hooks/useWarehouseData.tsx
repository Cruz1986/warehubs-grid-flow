
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WarehouseData {
  inbound: {
    today: number;
    yesterday: number;
  };
  outbound: {
    today: number;
    yesterday: number;
  };
  gridCapacity: {
    used: number;
    total: number;
  };
  pendingTotes: number;
}

export const useWarehouseData = () => {
  const [data, setData] = useState<WarehouseData>({
    inbound: {
      today: 0,
      yesterday: 0,
    },
    outbound: {
      today: 0,
      yesterday: 0,
    },
    gridCapacity: {
      used: 0,
      total: 0,
    },
    pendingTotes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        setIsLoading(true);
        
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISOString = today.toISOString();
        
        // Get yesterday's date at midnight
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayISOString = yesterday.toISOString();
        
        // Get inbound totes for today
        const { data: todayInbound, error: inboundError } = await supabase
          .from('tote_inbound')
          .select('count')
          .eq('status', 'inbound')
          .gte('timestamp_in', todayISOString)
          .single();
        
        if (inboundError && inboundError.code !== 'PGRST116') {
          console.error('Error fetching inbound totes:', inboundError);
        }
        
        // Get inbound totes for yesterday
        const { data: yesterdayInbound, error: yesterdayInboundError } = await supabase
          .from('tote_inbound')
          .select('count')
          .eq('status', 'inbound')
          .gte('timestamp_in', yesterdayISOString)
          .lt('timestamp_in', todayISOString)
          .single();
        
        if (yesterdayInboundError && yesterdayInboundError.code !== 'PGRST116') {
          console.error('Error fetching yesterday inbound totes:', yesterdayInboundError);
        }
        
        // Get outbound totes for today
        const { data: todayOutbound, error: outboundError } = await supabase
          .from('tote_outbound')
          .select('count')
          .eq('status', 'outbound')
          .gte('timestamp_out', todayISOString)
          .single();
        
        if (outboundError && outboundError.code !== 'PGRST116') {
          console.error('Error fetching outbound totes:', outboundError);
        }
        
        // Get outbound totes for yesterday
        const { data: yesterdayOutbound, error: yesterdayOutboundError } = await supabase
          .from('tote_outbound')
          .select('count')
          .eq('status', 'outbound')
          .gte('timestamp_out', yesterdayISOString)
          .lt('timestamp_out', todayISOString)
          .single();
        
        if (yesterdayOutboundError && yesterdayOutboundError.code !== 'PGRST116') {
          console.error('Error fetching yesterday outbound totes:', yesterdayOutboundError);
        }
        
        // Get staged totes (pending) - Directly fetch them
        const { data: stagedTotes, error: stagedError } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('status', 'staged');
        
        if (stagedError) {
          console.error('Error fetching staged totes:', stagedError);
        }
        
        const stagedTotesCount = stagedTotes?.length || 0;
        console.log('Staged totes count in useWarehouseData:', stagedTotesCount);
        
        // Get grid capacity
        const { data: grids, error: gridsError } = await supabase
          .from('grid_master')
          .select('*');
        
        if (gridsError) {
          console.error('Error fetching grids:', gridsError);
        }
        
        // Calculate grid usage - track occupied grids via destination_name
        const totalGrids = grids?.length || 0;
        // We don't have a 'status' field in grid_master, so we'll get staging data
        const { data: stagingData, error: stagingError } = await supabase
          .from('tote_staging')
          .select('grid_no')
          .eq('status', 'staged');
          
        if (stagingError) {
          console.error('Error fetching staging data:', stagingError);
        }
        
        // Count unique grid numbers that are occupied
        const occupiedGrids = new Set(stagingData?.map(item => item.grid_no) || []).size;
        
        // Update data state with explicit pending totes count
        setData({
          inbound: {
            today: Number(todayInbound?.count ?? 0),
            yesterday: Number(yesterdayInbound?.count ?? 0),
          },
          outbound: {
            today: Number(todayOutbound?.count ?? 0),
            yesterday: Number(yesterdayOutbound?.count ?? 0),
          },
          gridCapacity: {
            used: occupiedGrids,
            total: totalGrids,
          },
          pendingTotes: stagedTotesCount
        });
        
      } catch (error) {
        console.error('Error fetching warehouse data:', error);
        toast.error('Failed to load warehouse data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWarehouseData();
    
    // Set up real-time subscription for changes
    const channel = supabase
      .channel('warehouse-data-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchWarehouseData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, isLoading };
};
