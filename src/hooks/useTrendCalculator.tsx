
export interface TrendData {
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
}

export const useTrendCalculator = () => {
  const calculateTrend = (today: number, yesterday: number): TrendData => {
    const trend = today > yesterday 
      ? 'up' 
      : today < yesterday 
        ? 'down' 
        : 'neutral';
    
    let percentage = '0%';
    if (yesterday > 0) {
      const change = ((today - yesterday) / yesterday) * 100;
      percentage = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    }
    
    return { trend, percentage };
  };
  
  return { calculateTrend };
};
