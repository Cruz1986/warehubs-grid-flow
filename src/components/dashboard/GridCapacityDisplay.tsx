
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Grid2X2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GridStatus } from '@/hooks/useGridStatusData';

interface GridCapacityDisplayProps {
  gridStatuses: GridStatus[];
  isLoading: boolean;
}

const GridCapacityDisplay: React.FC<GridCapacityDisplayProps> = ({ gridStatuses, isLoading }) => {
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
                      className={`aspect-square flex items-center justify-center rounded-md text-xs font-medium border ${
                        isOccupied 
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                      title={`${grid.grid_number}: ${isOccupied ? 'Occupied' : 'Available'}`}
                    >
                      {index + 1}
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

export default GridCapacityDisplay;
