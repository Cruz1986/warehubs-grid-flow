
import React from 'react';
import StatusCard from './StatusCard';
import { Package } from 'lucide-react';

interface PendingTotesCardProps {
  count: number;
  isLoading: boolean;
}

const PendingTotesCard: React.FC<PendingTotesCardProps> = ({ count, isLoading }) => {
  return (
    <StatusCard
      title="Pending Totes"
      value={String(count)}
      description="Waiting for processing"
      icon={<Package className="h-4 w-4" />}
      isLoading={isLoading}
    />
  );
};

export default PendingTotesCard;
