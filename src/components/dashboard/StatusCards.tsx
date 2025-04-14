
import React, { useEffect, useState } from 'react';
import { Package, ArrowUpRight, ArrowDownRight, Grid } from 'lucide-react';
import StatusCard from './StatusCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const StatusCards = () => {
  const [stats, setStats] = useState({
    inbound: {
      today: 0,
      yesterday: 0,
      trend: 'neutral' as 'up' | 'down' | 'neutral',
      percentage: '0%'
    },
    outbound: {
      today: 0,
      yesterday: 0,
      trend: 'neutral' as 'up' | 'down' | 'neutral',
      percentage: '0%'
    },
    gridCapacity: {
      used: 0,
      total: 0,
    },
    pendingTotes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
        const gridUsagePercentage = totalGrids > 0 ? Math.round((usedGrids / totalGrids) * 100) : 0;
        
        // Calculate trends
        const todayInboundCount = parseInt(todayInbound?.count || '0');
        const yesterdayInboundCount = parseInt(yesterdayInbound?.count || '0');
        const inboundTrend = todayInboundCount > yesterdayInboundCount ? 'up' : 
                              todayInboundCount < yesterdayInboundCount ? 'down' : 'neutral';
        
        const todayOutboundCount = parseInt(todayOutbound?.count || '0');
        const yesterdayOutboundCount = parseInt(yesterdayOutbound?.count || '0');
        const outboundTrend = todayOutboundCount > yesterdayOutboundCount ? 'up' : 
                               todayOutboundCount < yesterdayOutboundCount ? 'down' : 'neutral';
        
        // Calculate percentage changes
        let inboundPercentage = '0%';
        if (yesterdayInboundCount > 0) {
          const inboundChange = ((todayInboundCount - yesterdayInboundCount) / yesterdayInboundCount) * 100;
          inboundPercentage = `${inboundChange > 0 ? '+' : ''}${inboundChange.toFixed(1)}%`;
        }
        
        let outboundPercentage = '0%';
        if (yesterdayOutboundCount > 0) {
          const outboundChange = ((todayOutboundCount - yesterdayOutboundCount) / yesterdayOutboundCount) * 100;
          outboundPercentage = `${outboundChange > 0 ? '+' : ''}${outboundChange.toFixed(1)}%`;
        }
        
        // Update stats state
        setStats({
          inbound: {
            today: todayInboundCount,
            yesterday: yesterdayInboundCount,
            trend: inboundTrend,
            percentage: inboundPercentage
          },
          outbound: {
            today: todayOutboundCount,
            yesterday: yesterdayOutboundCount,
            trend: outboundTrend,
            percentage: outboundPercentage
          },
          gridCapacity: {
            used: usedGrids,
            total: totalGrids,
          },
          pendingTotes: parseInt(pendingTotes?.count || '0')
        });
        
      } catch (error) {
        console.error('Error fetching warehouse stats:', error);
        toast.error('Failed to load warehouse statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
    
    // Set up real-time subscription for changes
    const channel = supabase
      .channel('table-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchStats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatusCard
        title="Inbound Today"
        value={String(stats.inbound.today)}
        description="Total totes received"
        icon={<ArrowDownRight className="h-4 w-4" />}
        trend={stats.inbound.trend}
        trendValue={stats.inbound.percentage}
        isLoading={isLoading}
      />
      
      <StatusCard
        title="Outbound Today"
        value={String(stats.outbound.today)}
        description="Total totes shipped"
        icon={<ArrowUpRight className="h-4 w-4" />}
        trend={stats.outbound.trend}
        trendValue={stats.outbound.percentage}
        isLoading={isLoading}
      />
      
      <StatusCard
        title="Grid Capacity"
        value={`${stats.gridCapacity.used > 0 && stats.gridCapacity.total > 0 ? 
          Math.round((stats.gridCapacity.used / stats.gridCapacity.total) * 100) : 0}%`}
        description={`${stats.gridCapacity.used}/${stats.gridCapacity.total} grids in use`}
        icon={<Grid className="h-4 w-4" />}
        isLoading={isLoading}
      />
      
      <StatusCard
        title="Pending Totes"
        value={String(stats.pendingTotes)}
        description="Waiting for processing"
        icon={<Package className="h-4 w-4" />}
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatusCards;
