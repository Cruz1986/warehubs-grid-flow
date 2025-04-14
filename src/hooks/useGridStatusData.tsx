
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GridStatus {
  id: string;
  grid_number: string;
  status: string;
}

export const useGridStatusData = () => {
  const [gridStatuses, setGridStatuses] = useState<GridStatus[]>([]);
  const [isLoadingGrids, setIsLoadingGrids] = useState(true);

  useEffect(() => {
    const fetchGridData = async () => {
      try {
        setIsLoadingGrids(true);
        
        const { data, error } = await supabase
          .from('grids')
          .select('*')
          .limit(25);
        
        if (error) {
          console.error('Error fetching grid data:', error);
        } else {
          setGridStatuses(data || []);
        }
      } catch (error) {
        console.error('Error fetching grid data:', error);
      } finally {
        setIsLoadingGrids(false);
      }
    };
    
    fetchGridData();
    
    const channel = supabase
      .channel('grid-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grids' }, () => {
        fetchGridData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    gridStatuses,
    isLoadingGrids
  };
};
