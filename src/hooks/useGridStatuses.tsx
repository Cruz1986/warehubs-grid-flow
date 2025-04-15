
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GridStatus {
  id: string;
  grid_number: string;
  status: string;
  source?: string;
  destination?: string;
}

export const useGridStatuses = () => {
  const [gridStatuses, setGridStatuses] = useState<GridStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGridData = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('grid_master')
          .select('*')
          .limit(25);
        
        if (error) {
          console.error('Error fetching grid data:', error);
        } else {
          const formattedGrids = data.map(grid => ({
            id: grid.id,
            grid_number: grid.grid_no,
            status: 'available', // Default status
            source: grid.source_name,
            destination: grid.destination_name
          }));
          setGridStatuses(formattedGrids);
        }
      } catch (error) {
        console.error('Error fetching grid data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGridData();
    
    const gridChannel = supabase
      .channel('grid-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grid_master' }, () => {
        fetchGridData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(gridChannel);
    };
  }, []);

  return { gridStatuses, isLoading };
};
