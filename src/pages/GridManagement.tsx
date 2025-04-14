
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
  const [validGrids, setValidGrids] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
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
        // For now, we're fetching all grid mappings - in a production app, 
        // you would want to filter by the user's facility
        const { data, error } = await supabase
          .from('grid_mappings')
          .select('*');

        if (error) {
          throw error;
        }

        // Create a mapping of grid numbers to destinations
        const gridMap: Record<string, string> = {};
        if (data) {
          data.forEach((mapping: any) => {
            gridMap[mapping.gridNumber] = mapping.destination;
          });
        }
        
        setValidGrids(gridMap);
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
    toast.success(`Tote ${toteId} scanned. Please scan a grid location.`);
  };
  
  const handleGridScan = () => {
    if (!scannedTote) {
      toast.error("Please scan a tote first");
      return;
    }
    
    if (!gridId) {
      toast.error("Please enter a grid ID");
      return;
    }
    
    // Check if grid exists in our valid grids
    if (Object.keys(validGrids).length > 0) {
      const destination = validGrids[gridId];
      if (!destination) {
        toast.error(`Grid ${gridId} is not valid. Please scan a valid grid.`);
        setGridId('');
        return;
      }
      
      // Grid is valid, proceed with staging
      addToStagedTotes(destination);
    } else {
      // Fallback to the mock data if no valid grids are loaded
      // This would be removed in a production version
      const mockGridMappings = {
        'G101': 'Facility B',
        'G102': 'Facility C',
        'G103': 'Facility D',
        'G104': 'Facility A',
        'G105': 'Facility B',
      };
      
      const destination = mockGridMappings[gridId as keyof typeof mockGridMappings];
      if (!destination) {
        toast.error(`Grid ${gridId} is not valid. Please scan a valid grid.`);
        setGridId('');
        return;
      }
      
      // Grid is valid, proceed with staging
      addToStagedTotes(destination);
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
              <Input
                type="text"
                placeholder="Scan or enter grid ID"
                value={gridId}
                onChange={(e) => setGridId(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={!scannedTote}
                ref={gridInputRef}
              />
              <Button 
                onClick={handleGridScan}
                disabled={!scannedTote}
              >
                Assign
              </Button>
            </div>
            
            {scannedTote && !gridId && (
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
