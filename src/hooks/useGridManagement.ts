
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tote } from '@/components/operations/ToteTable';

interface GridMappingData {
  grid_no: string;
  destination_name: string;
}

export const useGridManagement = () => {
  const [scannedTote, setScannedTote] = useState('');
  const [gridId, setGridId] = useState('');
  const [stagedTotes, setStagedTotes] = useState<Tote[]>([]);
  const [validGrids, setValidGrids] = useState<string[]>([]);
  const [gridDestinations, setGridDestinations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [gridError, setGridError] = useState('');
  
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const currentFacility = user?.facility || 'Unknown';
  const username = user?.username || 'unknown';
  
  // Fetch valid grid mappings from Supabase
  useEffect(() => {
    const fetchGridData = async () => {
      setIsLoading(true);
      try {
        // Fetch grid mappings from the grid_master table
        const { data, error } = await supabase
          .from('grid_master')
          .select('grid_no, destination_name')
          .order('grid_no', { ascending: true });

        if (error) {
          throw error;
        }

        // Create a list of valid grid numbers
        const grids: string[] = [];
        // Create a mapping of grid numbers to destinations
        const gridMap: Record<string, string> = {};
        
        if (data) {
          data.forEach((mapping: GridMappingData) => {
            grids.push(mapping.grid_no);
            gridMap[mapping.grid_no] = mapping.destination_name;
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
  
  const addToStagedTotes = async (destination: string) => {
    setIsLoading(true);
    
    try {
      // First, check if the tote exists in inbound
      const { data: inboundData, error: inboundError } = await supabase
        .from('tote_inbound')
        .select('source')
        .eq('tote_id', scannedTote)
        .eq('status', 'inbound')
        .single();
      
      // Get the original source from inbound record, or use current facility as fallback
      const originalSource = inboundData?.source || currentFacility;
      
      // Get current timestamp
      const now = new Date();
      
      // Insert to Supabase
      const { data, error } = await supabase
        .from('tote_staging')
        .insert({
          tote_id: scannedTote,
          status: 'staged',
          grid_no: gridId,
          destination: destination,
          operator_name: username,
          staging_facility: currentFacility,
          staging_user: username
        })
        .select();
      
      if (error) {
        console.error('Error adding tote to grid:', error);
        toast.error(`Failed to add tote to grid: ${error.message}`);
        return;
      }
      
      // Create new tote record with staged status
      const newTote: Tote = {
        id: scannedTote,
        status: 'staged',
        source: originalSource, // Use original source from inbound record
        destination,
        grid: gridId,
        timestamp: now.toISOString(),
        user: username,
        currentFacility: currentFacility,
      };
      
      // Add to staged totes list
      setStagedTotes([newTote, ...stagedTotes]);
      toast.success(`Tote ${scannedTote} has been staged at grid ${gridId} for ${destination}`);
      
      // Reset the tote scan to continue the workflow
      setScannedTote('');
      setGridId('');
      setGridError('');
    } catch (error: any) {
      console.error('Error staging tote:', error);
      toast.error(`Error staging tote: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
