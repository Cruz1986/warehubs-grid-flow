
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Grid2X2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface GridStatus {
  id: string;
  grid_number: string;
  status: string;
  tote_count?: number;
}

interface GridCapacityVisualProps {
  gridStatuses: GridStatus[];
  isLoading: boolean;
}

const GridCapacityVisual: React.FC<GridCapacityVisualProps> = ({ 
  gridStatuses: initialGridStatuses, 
  isLoading: initialLoading 
}) => {
  const [gridStatuses, setGridStatuses] = useState<GridStatus[]>(initialGridStatuses || []);
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    if (initialGridStatuses?.length > 0) {
      setGridStatuses(initialGridStatuses);
      return;
    }
    
    const fetchGridData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all grid numbers from grid_master
        const { data: grids, error: gridError } = await supabase
          .from('grid_master')
          .select('id, grid_no')
          .order('grid_no');
        
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
        
        // Format grid data
        const formattedGrids: GridStatus[] = grids?.map(grid => ({
          id: grid.id,
          grid_number: grid.grid_no,
          status: gridCounts[grid.grid_no] ? 'occupied' : 'available',
          tote_count: gridCounts[grid.grid_no] || 0
        })) || [];
        
        setGridStatuses(formattedGrids);
      } catch (error) {
        console.error('Error processing grid data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGridData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('grid-visual-changes')
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
  }, [initialGridStatuses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Grid2X2 className="mr-2 h-5 w-5" />
          Grid Capacity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-md" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-2">
              {gridStatuses.length > 0 ? 
                gridStatuses.map((grid, index) => {
                  const isOccupied = grid.status === 'occupied';
                  
                  return (
                    <div 
                      key={grid.id}
                      className={`aspect-square flex flex-col items-center justify-center rounded-md text-xs font-medium border ${
                        isOccupied 
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                      title={`${grid.grid_number}: ${isOccupied ? `${grid.tote_count} totes` : 'Available'}`}
                    >
                      <div>{grid.grid_number}</div>
                      {isOccupied && grid.tote_count && (
                        <div className="mt-1 text-[10px] bg-yellow-200 px-1 rounded-full">
                          {grid.tote_count}
                        </div>
                      )}
                    </div>
                  );
                }) : 
                Array.from({ length: 25 }).map((_, index) => {
                  return (
                    <div 
                      key={index}
                      className="aspect-square flex items-center justify-center rounded-md text-xs font-medium border bg-gray-50 border-gray-200 text-gray-500"
                    >
                      {index + 1}
                    </div>
                  );
                })
              }
            </div>
            <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-sm mr-1"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded-sm mr-1"></div>
                <span>Available</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GridCapacityVisual;
