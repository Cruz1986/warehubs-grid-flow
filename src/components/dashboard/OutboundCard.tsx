
import React from 'react';
import StatusCard from './StatusCard';
import { ArrowUpRight } from 'lucide-react';

interface OutboundCardProps {
  todayCount: number;
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
  isLoading: boolean;
}

const OutboundCard: React.FC<OutboundCardProps> = ({ 
  todayCount, 
  trend, 
  percentage, 
  isLoading 
}) => {
  return (
    <StatusCard
      title="Outbound Today"
      value={String(todayCount)}
      description="Total totes shipped"
      icon={<ArrowUpRight className="h-4 w-4" />}
      trend={trend}
      trendValue={percentage}
      isLoading={isLoading}
    />
  );
};

export default OutboundCard;
