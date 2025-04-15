
import { useMemo } from 'react';
import { useWarehouseData } from './useWarehouseData';
import { useTrendCalculator } from './useTrendCalculator';

export interface WarehouseStats {
  inbound: {
    today: number;
    yesterday: number;
    trend: 'up' | 'down' | 'neutral';
    percentage: string;
  };
  outbound: {
    today: number;
    yesterday: number;
    trend: 'up' | 'down' | 'neutral';
    percentage: string;
  };
  gridCapacity: {
    used: number;
    total: number;
  };
  pendingTotes: number;
}

export const useWarehouseStats = () => {
  const { data, isLoading } = useWarehouseData();
  const { calculateTrend } = useTrendCalculator();
  
  const stats = useMemo<WarehouseStats>(() => {
    const inboundTrend = calculateTrend(data.inbound.today, data.inbound.yesterday);
    const outboundTrend = calculateTrend(data.outbound.today, data.outbound.yesterday);
    
    return {
      inbound: {
        today: data.inbound.today,
        yesterday: data.inbound.yesterday,
        trend: inboundTrend.trend,
        percentage: inboundTrend.percentage
      },
      outbound: {
        today: data.outbound.today,
        yesterday: data.outbound.yesterday,
        trend: outboundTrend.trend,
        percentage: outboundTrend.percentage
      },
      gridCapacity: data.gridCapacity,
      pendingTotes: data.pendingTotes
    };
  }, [data, calculateTrend]);

  return { stats, isLoading };
};
