
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, PackageOpen, Grid2X2, PackageCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface RecentActivity {
  type: 'inbound' | 'staged' | 'outbound' | 'report';
  description: string;
  timestamp: string;
  count?: number;
}

interface RecentActivityCardProps {
  activities: RecentActivity[];
  isLoading: boolean;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ 
  activities, 
  isLoading 
}) => {
  return (
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
          ) : activities.length > 0 ? (
            activities.map((activity, index) => (
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
  );
};

export default RecentActivityCard;
