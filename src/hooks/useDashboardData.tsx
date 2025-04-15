
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemStatus } from '../components/dashboard/SystemStatusCard';
import { RecentActivity } from '../components/dashboard/RecentActivityCard';
import { Zap, Timer, Signal, BarChart } from 'lucide-react';

export const useDashboardData = () => {
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch inbound totes
        const { data: inboundData, error: inboundError } = await supabase
          .from('tote_inbound')
          .select('*')
          .eq('status', 'inbound')
          .order('timestamp_in', { ascending: false })
          .limit(1);
        
        // Fetch staged totes
        const { data: stagedData, error: stagedError } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('status', 'staged')
          .order('grid_timestamp', { ascending: false })
          .limit(1);
        
        // Fetch outbound totes
        const { data: outboundData, error: outboundError } = await supabase
          .from('tote_outbound')
          .select('*')
          .eq('status', 'outbound')
          .order('timestamp_out', { ascending: false })
          .limit(1);
        
        const activities: RecentActivity[] = [];
        
        if (!inboundError && inboundData && inboundData.length) {
          activities.push({
            type: 'inbound',
            description: `Tote ${inboundData[0].tote_id} received`,
            timestamp: new Date(inboundData[0].timestamp_in).toLocaleString(),
          });
        }
        
        if (!stagedError && stagedData && stagedData.length) {
          activities.push({
            type: 'staged',
            description: `Grid ${stagedData[0].grid_no} occupied`,
            timestamp: new Date(stagedData[0].grid_timestamp).toLocaleString(),
          });
        }
        
        if (!outboundError && outboundData && outboundData.length) {
          activities.push({
            type: 'outbound',
            description: `Tote ${outboundData[0].tote_id} shipped`,
            timestamp: new Date(outboundData[0].timestamp_out).toLocaleString(),
          });
        }
        
        setRecentActivities(activities);
        
        // System Status Calculation
        const statusList: SystemStatus[] = [
          {
            name: 'Database Sync',
            status: 'Connected',
            value: 'Connected',
            percentage: 100,
            icon: <Zap className="h-4 w-4" />,
            color: 'green',
          },
          {
            name: 'API Response',
            status: 'Healthy',
            value: '120ms',
            percentage: 85,
            icon: <Timer className="h-4 w-4" />,
            color: 'blue',
          },
          {
            name: 'Active Users',
            status: 'Online',
            value: '8 online',
            percentage: 40,
            icon: <Signal className="h-4 w-4" />,
            color: 'yellow',
          },
          {
            name: 'System Load',
            status: 'Normal',
            value: '15%',
            percentage: 15,
            icon: <BarChart className="h-4 w-4" />,
            color: 'purple',
          }
        ];
        
        setSystemStatuses(statusList);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Real-time subscription
    const channel = supabase
      .channel('admin-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchDashboardData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    recentActivities,
    systemStatuses,
    isLoading
  };
};
