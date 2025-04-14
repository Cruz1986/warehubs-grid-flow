
import { useState, useEffect } from 'react';
import { Facility, FacilityType } from '@/components/admin/GridMasterComponent';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GridMapping {
  source: string;
  sourceType: FacilityType;
  destination: string;
  destinationType: FacilityType;
  gridNumber: string;
}

interface UseGridAssignmentProps {
  facilities: Facility[];
  onAssignGrid: (mapping: GridMapping) => void;
}

export const useGridAssignment = ({ facilities, onAssignGrid }: UseGridAssignmentProps) => {
  const [facilityType, setFacilityType] = useState<string>('');
  const [sourceFacility, setSourceFacility] = useState<string>('');
  const [destinationFacility, setDestinationFacility] = useState<string>('');
  const [gridNumber, setGridNumber] = useState<string>('');
  const [existingGrids, setExistingGrids] = useState<{source: string, grid_number: string}[]>([]);
  const [isCheckingGrid, setIsCheckingGrid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get facilities by type
  const facilitiesByType = (type: string) => {
    return facilities.filter(f => f.type === type);
  };

  const typeToFacilities = {
    'Fulfillment Center': facilitiesByType('Fulfillment Center'),
    'Sourcing Hub': facilitiesByType('Sourcing Hub'),
    'Darkstore': facilitiesByType('Darkstore')
  };

  // Fetch existing grid numbers when component mounts
  useEffect(() => {
    const fetchExistingGrids = async () => {
      try {
        const { data, error } = await supabase
          .from('grid_mappings')
          .select('source, grid_number');
        
        if (error) {
          console.error('Error fetching existing grids:', error);
          return;
        }
        
        if (data) {
          setExistingGrids(data);
        }
      } catch (err) {
        console.error('Error in grid fetch:', err);
      }
    };
    
    fetchExistingGrids();
  }, []);

  const handleAssignGrid = async () => {
    if (!facilityType || !sourceFacility || !destinationFacility || !gridNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedSource = facilities.find(f => f.id === sourceFacility);
    const selectedDestination = facilities.find(f => f.id === destinationFacility);
    
    if (!selectedSource || !selectedDestination) {
      toast.error('Invalid source or destination facility');
      return;
    }

    setIsCheckingGrid(true);
    setIsSubmitting(true);
    
    try {
      // Check if the grid already exists for this source facility
      const isDuplicate = existingGrids.some(
        mapping => mapping.grid_number === gridNumber && mapping.source === selectedSource.name
      );
      
      if (isDuplicate) {
        toast.error(`Grid number ${gridNumber} already exists for source ${selectedSource.name}. Please use a different grid number for this source.`);
        setIsCheckingGrid(false);
        setIsSubmitting(false);
        return;
      }
      
      // Insert grid mapping into Supabase
      const { data, error } = await supabase
        .from('grid_mappings')
        .insert({
          source: selectedSource.name,
          source_type: selectedSource.type,
          destination: selectedDestination.name,
          destination_type: selectedDestination.type,
          grid_number: gridNumber
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          toast.error(`This exact source-destination-grid combination already exists.`);
        } else {
          console.error('Error adding grid mapping:', error);
          toast.error('Failed to add grid mapping');
        }
        setIsSubmitting(false);
        return;
      }

      // Update the local list of existing grids
      setExistingGrids([...existingGrids, {source: selectedSource.name, grid_number: gridNumber}]);

      // Call the prop function to update local state
      onAssignGrid({
        source: selectedSource.name,
        sourceType: selectedSource.type,
        destination: selectedDestination.name,
        destinationType: selectedDestination.type,
        gridNumber
      });

      // Reset grid number field after successful assignment
      setGridNumber('');
      toast.success('Grid mapping added successfully');
    } catch (err) {
      console.error('Error adding grid mapping:', err);
      toast.error('Failed to add grid mapping');
    } finally {
      setIsCheckingGrid(false);
      setIsSubmitting(false);
    }
  };

  return {
    facilityType,
    sourceFacility,
    destinationFacility,
    gridNumber,
    isCheckingGrid,
    isSubmitting,
    typeToFacilities,
    setFacilityType,
    setSourceFacility,
    setDestinationFacility,
    setGridNumber,
    handleAssignGrid
  };
};
