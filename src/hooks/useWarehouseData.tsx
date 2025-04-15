
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
          .from('totes')
          .select('count')
          .eq('status', 'inbound')
          .gte('created_at', todayISOString)
          .single();
        
        if (inboundError && inboundError.code !== 'PGRST116') {
          console.error('Error fetching inbound totes:', inboundError);
        }
        
        // Get inbound totes for yesterday
        const { data: yesterdayInbound, error: yesterdayInboundError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'inbound')
          .gte('created_at', yesterdayISOString)
          .lt('created_at', todayISOString)
          .single();
        
        if (yesterdayInboundError && yesterdayInboundError.code !== 'PGRST116') {
          console.error('Error fetching yesterday inbound totes:', yesterdayInboundError);
        }
        
        // Get outbound totes for today
        const { data: todayOutbound, error: outboundError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'outbound')
          .gte('created_at', todayISOString)
          .single();
        
        if (outboundError && outboundError.code !== 'PGRST116') {
          console.error('Error fetching outbound totes:', outboundError);
        }
        
        // Get outbound totes for yesterday
        const { data: yesterdayOutbound, error: yesterdayOutboundError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'outbound')
          .gte('created_at', yesterdayISOString)
          .lt('created_at', todayISOString)
          .single();
        
        if (yesterdayOutboundError && yesterdayOutboundError.code !== 'PGRST116') {
          console.error('Error fetching yesterday outbound totes:', yesterdayOutboundError);
        }
        
        // Get pending totes
        const { data: pendingTotes, error: pendingError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'inbound')
          .single();
        
        if (pendingError && pendingError.code !== 'PGRST116') {
          console.error('Error fetching pending totes:', pendingError);
        }
        
        // Get grid capacity
        const { data: grids, error: gridsError } = await supabase
          .from('grids')
          .select('*');
        
        if (gridsError) {
          console.error('Error fetching grids:', gridsError);
        }
        
        // Calculate grid usage
        const totalGrids = grids?.length || 0;
        const usedGrids = grids?.filter(grid => grid.status === 'occupied').length || 0;
        
        // Update data state
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
            used: usedGrids,
            total: totalGrids,
          },
          pendingTotes: Number(pendingTotes?.count ?? 0)
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
