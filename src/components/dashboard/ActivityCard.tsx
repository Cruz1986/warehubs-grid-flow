
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Package, Grid2X2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityCardProps {
  facilityData: {
    [key: string]: number;
  };
  isLoading: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ facilityData, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BarChart className="mr-2 h-5 w-5" />
          Today's Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(facilityData).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {key === 'Inbound' && <Package className="h-4 w-4 text-blue-600" />}
                    {key === 'Staged' && <Grid2X2 className="h-4 w-4 text-yellow-600" />}
                    {key === 'Outbound' && <Package className="h-4 w-4 text-green-600" />}
                    {key === 'Pending' && <Package className="h-4 w-4 text-red-600" />}
                    <span className="text-sm font-medium">{key}</span>
                  </div>
                  <span className="text-sm font-bold">{value.toString()} totes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      key === 'Inbound' ? 'bg-blue-600' : 
                      key === 'Staged' ? 'bg-yellow-600' : 
                      key === 'Outbound' ? 'bg-green-600' : 
                      'bg-red-600'
                    }`} 
                    style={{ width: `${Math.min(100, (value / Math.max(1, Object.values(facilityData).reduce((a, b) => a + b, 0))) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
