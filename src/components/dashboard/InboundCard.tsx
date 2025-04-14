
import React from 'react';
import StatusCard from './StatusCard';
import { ArrowDownRight } from 'lucide-react';

interface InboundCardProps {
  todayCount: number;
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
  isLoading: boolean;
}

const InboundCard: React.FC<InboundCardProps> = ({ 
  todayCount, 
  trend, 
  percentage, 
  isLoading 
}) => {
  return (
    <StatusCard
      title="Inbound Today"
      value={String(todayCount)}
      description="Total totes received"
      icon={<ArrowDownRight className="h-4 w-4" />}
      trend={trend}
      trendValue={percentage}
      isLoading={isLoading}
    />
  );
};

export default InboundCard;
