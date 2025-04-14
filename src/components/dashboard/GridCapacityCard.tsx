
import React from 'react';
import StatusCard from './StatusCard';
import { Grid } from 'lucide-react';

interface GridCapacityCardProps {
  used: number;
  total: number;
  isLoading: boolean;
}

const GridCapacityCard: React.FC<GridCapacityCardProps> = ({ 
  used, 
  total, 
  isLoading 
}) => {
  const usagePercentage = used > 0 && total > 0 ? 
    Math.round((used / total) * 100) : 0;
  
  return (
    <StatusCard
      title="Grid Capacity"
      value={`${usagePercentage}%`}
      description={`${String(used)}/${String(total)} grids in use`}
      icon={<Grid className="h-4 w-4" />}
      isLoading={isLoading}
    />
  );
};

export default GridCapacityCard;
