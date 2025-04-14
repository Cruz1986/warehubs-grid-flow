
import React from 'react';
import StatusCard from './StatusCard';
import { 
  TrendingUp, 
  PackageOpen, 
  Truck, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatusCards = () => {
  // Mock data for demonstration
  const inboundRate = "+12.5%";
  const outboundRate = "-3.4%";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatusCard
        title="Total Inbound"
        value="1,234"
        description="Total items received this month"
        icon={<PackageOpen className="h-4 w-4" />}
        footer={
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            <span className="text-green-500 font-medium">{inboundRate}</span>
            <span className="ml-1">from last month</span>
          </div>
        }
      />
      
      <StatusCard
        title="Total Outbound"
        value="856"
        description="Items shipped this month"
        icon={<Truck className="h-4 w-4" />}
        footer={
          <div className="flex items-center text-xs text-muted-foreground">
            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
            <span className="text-red-500 font-medium">{outboundRate}</span>
            <span className="ml-1">from last month</span>
          </div>
        }
      />
      
      <StatusCard
        title="Active Grids"
        value="42"
        description="Currently active storage grids"
        icon={<BarChart3 className="h-4 w-4" />}
        footer={
          <div className="flex items-center text-xs text-muted-foreground">
            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
            <span className="text-green-500 font-medium">+8.1%</span>
            <span className="ml-1">grid utilization</span>
          </div>
        }
      />
      
      <StatusCard
        title="Efficiency Rate"
        value="94.2%"
        description="Overall warehouse efficiency"
        icon={<TrendingUp className="h-4 w-4" />}
        footer={
          <div className="flex items-center text-xs text-muted-foreground">
            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
            <span className="text-green-500 font-medium">+2.5%</span>
            <span className="ml-1">from last week</span>
          </div>
        }
      />
    </div>
  );
};

export default StatusCards;
