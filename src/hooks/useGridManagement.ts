
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GridMappingData {
  grid_number: string;
  destination: string;
}

interface StagedTote {
  id: string;
  status: string;
  source: string;
  destination: string;
  grid: string;
  timestamp: string;
  user: string;
}

export const useGridManagement = () => {
  const [scannedTote, setScannedTote] = useState('');
  const [gridId, setGridId] = useState('');
  const [stagedTotes, setStagedTotes] = useState<StagedTote[]>([]);
  const [validGrids, setValidGrids] = useState<string[]>([]);
  const [gridDestinations, setGridDestinations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [gridError, setGridError] = useState('');
  
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
          data.forEach((mapping: GridMappingData) => {
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

  const handleToteScan = (toteId: string) => {
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
  };

  return {
    scannedTote,
    gridId,
    stagedTotes,
    validGrids,
    isLoading,
    gridError,
    handleToteScan,
    handleGridChange,
    handleGridScan
  };
};
