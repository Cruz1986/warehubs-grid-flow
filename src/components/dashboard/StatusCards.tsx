
import React from 'react';
import { Package, ArrowUpRight, ArrowDownRight, Grid } from 'lucide-react';
import StatusCard from './StatusCard';

const StatusCards = () => {
  // In a real app, this data would come from your Google Sheets database
  const mockData = {
    inbound: {
      today: 125,
      yesterday: 112,
      trend: 'up',
      percentage: '+11.6%'
    },
    outbound: {
      today: 87,
      yesterday: 94,
      trend: 'down',
      percentage: '-7.4%'
    },
    gridCapacity: {
      used: 65,
      total: 100,
    },
    pendingTotes: 15
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatusCard
        title="Inbound Today"
        value={mockData.inbound.today}
        description="Total totes received"
        icon={<ArrowDownRight className="h-4 w-4" />}
        trend={mockData.inbound.trend as 'up' | 'down'}
        trendValue={mockData.inbound.percentage}
      />
      
      <StatusCard
        title="Outbound Today"
        value={mockData.outbound.today}
        description="Total totes shipped"
        icon={<ArrowUpRight className="h-4 w-4" />}
        trend={mockData.outbound.trend as 'up' | 'down'}
        trendValue={mockData.outbound.percentage}
      />
      
      <StatusCard
        title="Grid Capacity"
        value={`${mockData.gridCapacity.used}%`}
        description={`${mockData.gridCapacity.used}/${mockData.gridCapacity.total} grids in use`}
        icon={<Grid className="h-4 w-4" />}
      />
      
      <StatusCard
        title="Pending Totes"
        value={mockData.pendingTotes}
        description="Waiting for processing"
        icon={<Package className="h-4 w-4" />}
      />
    </div>
  );
};

export default StatusCards;
