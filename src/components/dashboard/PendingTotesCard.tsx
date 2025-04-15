
import React, { useEffect, useState } from 'react';
import StatusCard from './StatusCard';
import { Package } from 'lucide-react';
import { getPendingTotesCount } from '@/integrations/googleScript/client';

interface PendingTotesCardProps {
  count?: number;
  isLoading?: boolean;
}

const PendingTotesCard: React.FC<PendingTotesCardProps> = ({ 
  count: initialCount,
  isLoading: initialLoading = false
}) => {
  const [count, setCount] = useState(initialCount || 0);
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    if (initialCount !== undefined) {
      setCount(initialCount);
      return;
    }

    const fetchPendingTotes = async () => {
      try {
        setIsLoading(true);
        const pendingCount = await getPendingTotesCount();
        setCount(pendingCount);
      } catch (error) {
        console.error('Error fetching pending totes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingTotes();
  }, [initialCount]);

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
