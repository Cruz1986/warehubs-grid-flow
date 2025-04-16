
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GridStatus {
  id: string;
  grid_number: string;
  status: string;
  source?: string;
  destination?: string;
  tote_count?: number;
}

export const useGridData = () => {
  const [gridStatuses, setGridStatuses] = useState<GridStatus[]>([]);
  const [isLoadingGrids, setIsLoadingGrids] = useState(true);

  useEffect(() => {
    const fetchGridData = async () => {
      try {
        setIsLoadingGrids(true);
        
        // Fetch grid master data
        const { data: gridData, error: gridError } = await supabase
          .from('grid_master')
          .select('*')
          .limit(25);
        
        if (gridError) {
          console.error('Error fetching grid data:', gridError);
          return;
        }
        
        // Fetch staged totes to count per grid
        const { data: stagedTotes, error: stagedError } = await supabase
          .from('tote_staging')
          .select('grid_no')
          .eq('status', 'staged');
          
        if (stagedError) {
          console.error('Error fetching staged totes:', stagedError);
          return;
        }
        
        // Count totes per grid
        const gridCounts: Record<string, number> = {};
        stagedTotes?.forEach(tote => {
          gridCounts[tote.grid_no] = (gridCounts[tote.grid_no] || 0) + 1;
        });
        
        const formattedGrids: GridStatus[] = gridData.map(grid => ({
          id: grid.id,
          grid_number: grid.grid_no,
          status: gridCounts[grid.grid_no] ? 'occupied' : 'available',
          source: grid.source_name,
          destination: grid.destination_name,
          tote_count: gridCounts[grid.grid_no] || 0
        }));
        
        setGridStatuses(formattedGrids);
      } catch (error) {
        console.error('Error fetching grid data:', error);
      } finally {
        setIsLoadingGrids(false);
      }
    };
    
    fetchGridData();
    
    // Set up real-time subscriptions
    const gridChannel = supabase
      .channel('grid-data-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'grid_master' 
      }, () => {
        fetchGridData();
      })
      .subscribe();
      
    const toteChannel = supabase
      .channel('tote-staging-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tote_staging' 
      }, () => {
        fetchGridData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(gridChannel);
      supabase.removeChannel(toteChannel);
    };
  }, []);

  return {
    gridStatuses,
    isLoadingGrids
  };
};
