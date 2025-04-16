
import React, { useEffect, useState } from 'react';
import StatusCard from './StatusCard';
import { Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PendingTotesCardProps {
  count?: number;
  isLoading?: boolean;
}

const PendingTotesCard: React.FC<PendingTotesCardProps> = ({ 
  count: initialCount,
  isLoading: initialLoading = false
}) => {
  const [count, setCount] = useState<number | undefined>(initialCount);
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    // Update the count when the prop changes
    if (initialCount !== undefined) {
      setCount(initialCount);
      return;
    }

    const fetchStagedTotes = async () => {
      try {
        setIsLoading(true);
        
        // Get all staged totes
        const { data: stagedTotes, error } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('status', 'staged');
        
        if (error) {
          console.error('Error fetching staged totes:', error);
          return;
        }
        
        // Count the number of staged totes
        setCount(stagedTotes?.length || 0);
        console.log('Staged totes count:', stagedTotes?.length || 0);
      } catch (error) {
        console.error('Error fetching staged totes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStagedTotes();
    
    // Set up real-time subscription for changes
    const channel = supabase
      .channel('staged-totes-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tote_staging' 
      }, () => {
        fetchStagedTotes();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialCount]);

  return (
    <StatusCard
      title="Staged Totes"
      value={count !== undefined ? String(count) : "Loading..."}
      description="Awaiting outbound processing"
      icon={<Package className="h-4 w-4" />}
      isLoading={isLoading}
    />
  );
};

export default PendingTotesCard;
