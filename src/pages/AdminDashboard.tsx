
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Calendar, 
  PackageOpen, 
  PackageCheck, 
  Grid2X2, 
  Zap,
  Timer,
  Signal 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentActivity {
  type: 'inbound' | 'staged' | 'outbound' | 'report';
  description: string;
  timestamp: string;
  count?: number;
}

interface SystemStatus {
  name: string;
  status: string;
  value: string;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

const AdminDashboard = () => {
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setIsLoading(true);
        
        // Fetch inbound totes
        const { data: inboundData, error: inboundError } = await supabase
          .from('totes')
          .select('*')
          .eq('status', 'inbound')
          .order('created_at', { ascending: false })
          .limit(1);
        
        // Fetch staged totes
        const { data: stagedData, error: stagedError } = await supabase
          .from('grids')
          .select('*')
          .eq('status', 'occupied')
          .order('created_at', { ascending: false })
          .limit(1);
        
        // Fetch outbound totes
        const { data: outboundData, error: outboundError } = await supabase
          .from('totes')
          .select('*')
          .eq('status', 'outbound')
          .order('created_at', { ascending: false })
          .limit(1);
        
        const activities: RecentActivity[] = [];
        
        if (!inboundError && inboundData.length) {
          activities.push({
            type: 'inbound',
            description: `Tote ${inboundData[0].tote_number} received`,
            timestamp: new Date(inboundData[0].created_at).toLocaleString(),
          });
        }
        
        if (!stagedData && stagedData.length) {
          activities.push({
            type: 'staged',
            description: `Grid ${stagedData[0].grid_number} occupied`,
            timestamp: new Date(stagedData[0].created_at).toLocaleString(),
          });
        }
        
        if (!outboundError && outboundData.length) {
          activities.push({
            type: 'outbound',
            description: `Tote ${outboundData[0].tote_number} shipped`,
            timestamp: new Date(outboundData[0].created_at).toLocaleString(),
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
    
    fetchRecentActivities();
    
    // Real-time subscription
    const channel = supabase
      .channel('admin-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchRecentActivities();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <DashboardLayout requireAdmin={true}>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <StatusCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {activity.type === 'inbound' && <PackageOpen className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'staged' && <Grid2X2 className="h-4 w-4 text-yellow-600" />}
                      {activity.type === 'outbound' && <PackageCheck className="h-4 w-4 text-green-600" />}
                      <span className="text-sm">{activity.description}</span>
                    </div>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">System Status</CardTitle>
            <BarChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              ) : (
                systemStatuses.map((status, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{status.name}</span>
                      <span className={`text-xs bg-${status.color}-100 text-${status.color}-800 px-2 py-1 rounded-full`}>
                        {status.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${status.color}-600 h-2 rounded-full`} 
                        style={{ width: `${status.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
