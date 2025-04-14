
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid2X2 } from 'lucide-react';
import GridNumberField from '@/components/admin/grid-master/GridNumberField';

interface GridScannerProps {
  scannedTote: string;
  gridId: string;
  validGrids: string[];
  isLoading: boolean;
  gridError: string;
  onGridChange: (value: string) => void;
  onGridScan: () => void;
}

const GridScanner: React.FC<GridScannerProps> = ({
  scannedTote,
  gridId,
  validGrids,
  isLoading,
  gridError,
  onGridChange,
  onGridScan
}) => {
  const gridInputRef = useRef<HTMLInputElement>(null);

  // When scannedTote changes and is not empty, focus on grid input
  useEffect(() => {
    if (scannedTote && gridInputRef.current) {
      // Focus with a small delay to ensure the DOM is ready
      setTimeout(() => {
        if (gridInputRef.current) {
          gridInputRef.current.focus();
        }
      }, 100);
    }
  }, [scannedTote]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onGridScan();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Grid2X2 className="mr-2 h-5 w-5" />
          Grid Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <div className="flex-1">
            <GridNumberField
              gridNumber={gridId}
              onChange={onGridChange}
              disabled={!scannedTote}
              validGrids={validGrids}
              error={gridError}
              inputRef={gridInputRef}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button 
            onClick={onGridScan}
            disabled={!scannedTote}
            className="mt-8"
          >
            Assign
          </Button>
        </div>
        
        {scannedTote && !gridId && !gridError && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
            <p className="text-sm">
              Tote <span className="font-bold">{scannedTote}</span> is ready to be assigned to a grid.
              Please scan a grid location.
            </p>
          </div>
        )}
        
        {isLoading && (
          <div className="mt-4 p-3 bg-gray-50 text-gray-800 rounded-md">
            <p className="text-sm">Loading grid data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GridScanner;
