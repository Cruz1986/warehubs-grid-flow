
import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ToteScanner from '../components/operations/ToteScanner';
import ToteTable from '../components/operations/ToteTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Grid2X2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import GridNumberField from '@/components/admin/grid-master/GridNumberField';

// Grid Mapping interface
interface GridMapping {
  id: string;
  source: string;
  sourceType: string;
  destination: string;
  destinationType: string;
  gridNumber: string;
}

const GridManagement = () => {
  const [scannedTote, setScannedTote] = useState('');
  const [gridId, setGridId] = useState('');
  const [stagedTotes, setStagedTotes] = useState<any[]>([]);
  const [validGrids, setValidGrids] = useState<string[]>([]);
  const [gridDestinations, setGridDestinations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [gridError, setGridError] = useState('');
  const gridInputRef = useRef<HTMLInputElement>(null);
  const toteInputRef = useRef<HTMLInputElement>(null);
  
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Fetch valid grid mappings from Supabase
  useEffect(() => {
    const fetchGridData = async () => {
      setIsLoading(true);
      try {
        // Fetch grid mappings from the grid_mappings table
        const { data, error } = await supabase
          .from('grid_mappings')
          .select('grid_number, destination')
          .order('grid_number', { ascending: true });

        if (error) {
          throw error;
        }

        // Create a list of valid grid numbers
        const grids: string[] = [];
        // Create a mapping of grid numbers to destinations
        const gridMap: Record<string, string> = {};
        
        if (data) {
          data.forEach((mapping: any) => {
            grids.push(mapping.grid_number);
            gridMap[mapping.grid_number] = mapping.destination;
          });
        }
        
        setValidGrids(grids);
        setGridDestinations(gridMap);
      } catch (error) {
        console.error('Error fetching grid data:', error);
        toast.error('Failed to load grid data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGridData();
  }, []);
  
  // Focus on tote input initially
  useEffect(() => {
    if (toteInputRef.current) {
      toteInputRef.current.focus();
    }
  }, []);
  
  // When tote is scanned, focus on grid input
  useEffect(() => {
    if (scannedTote && gridInputRef.current) {
      gridInputRef.current.focus();
    }
  }, [scannedTote]);
  
  const handleToteScan = (toteId: string) => {
    // In a real app, this would check if the tote exists and is in "inbound" status
    // For this demo, we'll just set the scanned tote
    setScannedTote(toteId);
    setGridError('');
    toast.success(`Tote ${toteId} scanned. Please scan a grid location.`);
  };
  
  const handleGridChange = (value: string) => {
    setGridId(value);
    setGridError('');
  };
  
  const handleGridScan = () => {
    if (!scannedTote) {
      toast.error("Please scan a tote first");
      return;
    }
    
    if (!gridId) {
      setGridError("Please enter a grid ID");
      return;
    }
    
    // Check if grid exists in our valid grids
    if (validGrids.length > 0) {
      const destination = gridDestinations[gridId];
      if (!destination) {
        setGridError(`Grid ${gridId} is not a valid grid number`);
        return;
      }
      
      // Grid is valid, proceed with staging
      addToStagedTotes(destination);
    } else {
      setGridError("No valid grids available. Please add grid mappings in the Grid Master section.");
      return;
    }
  };
  
  const addToStagedTotes = (destination: string) => {
    // Get current timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    // Create new tote record with staged status
    const newTote = {
      id: scannedTote,
      status: 'staged',
      source: user?.facility || '',
      destination,
      grid: gridId,
      timestamp,
      user: user?.username || 'unknown',
    };
    
    // Add to staged totes list
    setStagedTotes([newTote, ...stagedTotes]);
    toast.success(`Tote ${scannedTote} has been staged at grid ${gridId} for ${destination}`);
    
    // Reset the form
    setScannedTote('');
    setGridId('');
    setGridError('');
    
    // Focus back on tote scanner after completing the workflow
    if (toteInputRef.current) {
      toteInputRef.current.focus();
    }
    
    // In a real app, this would also update the tote status in Supabase
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGridScan();
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Grid Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ToteScanner
          onScan={handleToteScan}
          placeholder="Scan tote to place in grid"
          inputRef={toteInputRef}
        />
        
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
                  onChange={handleGridChange}
                  disabled={!scannedTote}
                  validGrids={validGrids}
                  error={gridError}
                />
              </div>
              <Button 
                onClick={handleGridScan}
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
      </div>
      
      <ToteTable
        totes={stagedTotes}
        title="Recently Staged Totes"
      />
    </DashboardLayout>
  );
};

export default GridManagement;
