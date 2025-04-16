
import React, { useEffect, useState } from 'react';
import StatusCard from './StatusCard';
import { Grid } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GridCapacityCardProps {
  used: number;
  total: number;
  isLoading: boolean;
}

const GridCapacityCard: React.FC<GridCapacityCardProps> = ({ 
  used, 
  total, 
  isLoading: initialLoading
}) => {
  const [gridStats, setGridStats] = useState({ used, total });
  const [isLoading, setIsLoading] = useState(initialLoading);
  const usagePercentage = gridStats.used > 0 && gridStats.total > 0 ? 
    Math.round((gridStats.used / gridStats.total) * 100) : 0;
  
  useEffect(() => {
    if (used !== undefined && total !== undefined) {
      setGridStats({ used, total });
      return;
    }
    
    const fetchGridData = async () => {
      try {
        setIsLoading(true);
        
        // Get all grid mappings to count total possible grids
        const { data: gridMappings, error: gridError } = await supabase
          .from('grid_master')
          .select('grid_no');
          
        if (gridError) {
          console.error('Error fetching grid mappings:', gridError);
          return;
        }
        
        // Get all grid numbers with staged totes
        const { data: stagedGrids, error: stagedError } = await supabase
          .from('tote_staging')
          .select('grid_no')
          .eq('status', 'staged');
          
        if (stagedError) {
          console.error('Error fetching staged grids:', stagedError);
          return;
        }
        
        // Count unique grid numbers that are in use
        const uniqueGrids = new Set(stagedGrids?.map(item => item.grid_no) || []);
        
        setGridStats({
          used: uniqueGrids.size,
          total: gridMappings?.length || 0
        });
      } catch (error) {
        console.error('Error fetching grid data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGridData();
    
    // Set up real-time subscription for changes
    const channel = supabase
      .channel('grid-status-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tote_staging' 
      }, () => {
        fetchGridData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [used, total]);
  
  return (
    <StatusCard
      title="Grid Capacity"
      value={`${usagePercentage}%`}
      description={`${String(gridStats.used)}/${String(gridStats.total)} grids in use`}
      icon={<Grid className="h-4 w-4" />}
      isLoading={isLoading}
    />
  );
};

export default GridCapacityCard;
