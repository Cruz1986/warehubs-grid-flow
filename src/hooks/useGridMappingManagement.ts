
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GridMapping {
  id: string;
  source_name: string;
  destination_name: string;
  grid_no: string;
}

export const useGridMappingManagement = () => {
  const [gridMappings, setGridMappings] = useState<GridMapping[]>([]);

  const fetchGridMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('grid_master')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setGridMappings(data);
    } catch (error) {
      console.error('Error fetching grid mappings:', error);
      toast.error('Failed to load grid mappings');
    }
  };

  useEffect(() => {
    fetchGridMappings();

    // Set up real-time subscription
    const channel = supabase
      .channel('grid-mappings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'grid_master' }, 
        () => fetchGridMappings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleGridAssigned = (newMapping: GridMapping) => {
    setGridMappings([...gridMappings, newMapping]);
    toast.success(`Grid ${newMapping.grid_no} assigned successfully`);
  };

  const handleGridDeleted = (mappingId: string) => {
    setGridMappings(gridMappings.filter(m => m.id !== mappingId));
    toast.success('Grid mapping deleted successfully');
  };

  return {
    gridMappings,
    handleGridAssigned,
    handleGridDeleted
  };
};
