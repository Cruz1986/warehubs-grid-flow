
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface SystemStatus {
  name: string;
  status: string;
  value: string;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

interface SystemStatusCardProps {
  systemStatuses: SystemStatus[];
  isLoading: boolean;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ 
  systemStatuses, 
  isLoading 
}) => {
  return (
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
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;
