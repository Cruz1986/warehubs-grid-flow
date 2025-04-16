
import React from 'react';
import InboundCard from './InboundCard';
import OutboundCard from './OutboundCard';
import PendingTotesCard from './PendingTotesCard';
import { useWarehouseStats } from '@/hooks/useWarehouseStats';

const StatusCards = () => {
  const { stats, isLoading } = useWarehouseStats();

  // Log the stats to help with debugging
  console.log('StatusCards stats:', stats);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <InboundCard
        todayCount={stats.inbound.today}
        trend={stats.inbound.trend}
        percentage={stats.inbound.percentage}
        isLoading={isLoading}
      />
      
      <OutboundCard
        todayCount={stats.outbound.today}
        trend={stats.outbound.trend}
        percentage={stats.outbound.percentage}
        isLoading={isLoading}
      />
      
      <PendingTotesCard
        count={stats.pendingTotes}
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatusCards;
