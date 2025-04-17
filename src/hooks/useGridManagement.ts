import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tote } from '@/components/operations/ToteTable';
import { useToteRegister } from '@/hooks/useToteRegister';

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
  
  // Use the improved tote register hook
  const { updateToteGrid, trackToteFacilityTransfer } = useToteRegister();
  
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

  // Fetch initial staged totes
  useEffect(() => {
    const fetchStagedTotes = async () => {
      try {
        const { data, error } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('status', 'staged')
          .order('grid_timestamp', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        const formattedStaged = data.map(tote => ({
          id: tote.tote_id,
          status: 'staged' as const,
          source: tote.staging_facility || 'Unknown',
          destination: tote.destination || 'Unknown',
          timestamp: tote.grid_timestamp ? new Date(tote.grid_timestamp).toISOString() : new Date().toISOString(),
          user: tote.staging_user || 'Unknown',
          grid: tote.grid_no,
          currentFacility: tote.staging_facility || 'Unknown',
        }));
        
        setStagedTotes(formattedStaged);
      } catch (error) {
        console.error('Error fetching staged totes:', error);
      }
    };
    
    fetchStagedTotes();
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
  
  const handleGridScan = async () => {
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
      await addToStagedTotes(destination);
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
      const timestamp = now.toISOString();
      
      // Insert to tote_staging table
      const { data, error } = await supabase
        .from('tote_staging')
        .insert({
          tote_id: scannedTote,
          status: 'staged',
          grid_no: gridId,
          destination: destination,
          operator_name: username,
          staging_facility: currentFacility,
          staging_user: username,
          grid_timestamp: timestamp
        })
        .select();
      
      if (error) {
        console.error('Error adding tote to grid:', error);
        toast.error(`Failed to add tote to grid: ${error.message}`);
        return;
      }
      
      // Update tote register with the grid information
      const registerUpdated = await updateToteGrid(
        scannedTote, 
        gridId, 
        currentFacility, 
        username
      );
      
      if (!registerUpdated) {
        console.warn(`Tote ${scannedTote} was staged but register update failed - attempting fallback`);
        
        // Fallback - try to track as a facility transfer with staged status
        await trackToteFacilityTransfer(
          scannedTote,
          originalSource,
          destination,
          username,
          'staged'
        );
      }
      
      // Create new tote record with staged status
      const newTote: Tote = {
        id: scannedTote,
        status: 'staged',
        source: originalSource,
        destination,
        grid: gridId,
        timestamp: timestamp,
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