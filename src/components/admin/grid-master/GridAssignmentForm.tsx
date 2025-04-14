
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Facility, FacilityType } from '../GridMasterComponent';
import { toast } from 'sonner';
import { Grid } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GridAssignmentFormProps {
  facilities: Facility[];
  onAssignGrid: (mapping: {
    source: string;
    sourceType: FacilityType;
    destination: string;
    destinationType: FacilityType;
    gridNumber: string;
  }) => void;
  isSubmitting: boolean;
}

const GridAssignmentForm: React.FC<GridAssignmentFormProps> = ({ 
  facilities, 
  onAssignGrid,
  isSubmitting 
}) => {
  const [facilityType, setFacilityType] = useState<string>('');
  const [sourceFacility, setSourceFacility] = useState<string>('');
  const [destinationFacility, setDestinationFacility] = useState<string>('');
  const [gridNumber, setGridNumber] = useState<string>('');
  const [existingGrids, setExistingGrids] = useState<string[]>([]);
  const [isCheckingGrid, setIsCheckingGrid] = useState(false);

  // Fetch existing grid numbers when component mounts
  useEffect(() => {
    const fetchExistingGrids = async () => {
      try {
        const { data, error } = await supabase
          .from('grid_mappings')
          .select('grid_number');
        
        if (error) {
          console.error('Error fetching existing grids:', error);
          return;
        }
        
        if (data) {
          const gridNumbers = data.map(item => item.grid_number);
          setExistingGrids(gridNumbers);
        }
      } catch (err) {
        console.error('Error in grid fetch:', err);
      }
    };
    
    fetchExistingGrids();
  }, []);

  const facilitiesByType = (type: string) => {
    return facilities.filter(f => f.type === type);
  };

  const typeToFacilities = {
    'Fulfillment Center': facilitiesByType('Fulfillment Center'),
    'Sourcing Hub': facilitiesByType('Sourcing Hub'),
    'Darkstore': facilitiesByType('Darkstore')
  };

  const handleAssignGrid = async () => {
    if (!facilityType || !sourceFacility || !destinationFacility || !gridNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if grid number already exists
    if (existingGrids.includes(gridNumber)) {
      toast.error(`Grid number ${gridNumber} already exists. Please use a different grid number.`);
      return;
    }

    const selectedSource = facilities.find(f => f.id === sourceFacility);
    const selectedDestination = facilities.find(f => f.id === destinationFacility);
    
    if (!selectedSource || !selectedDestination) {
      toast.error('Invalid source or destination facility');
      return;
    }

    setIsCheckingGrid(true);
    
    try {
      // First check if the grid already exists
      const { data: existingGrid, error: checkError } = await supabase
        .from('grid_mappings')
        .select('id')
        .eq('grid_number', gridNumber)
        .single();
      
      if (!checkError && existingGrid) {
        toast.error(`Grid number ${gridNumber} already exists. Please use a different grid number.`);
        setIsCheckingGrid(false);
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
          toast.error(`Grid number ${gridNumber} already exists. Please use a different grid number.`);
        } else {
          console.error('Error adding grid mapping:', error);
          toast.error('Failed to add grid mapping');
        }
        return;
      }

      // Update the local list of existing grids
      setExistingGrids([...existingGrids, gridNumber]);

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
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <Label htmlFor="facility-type">Facility Type</Label>
        <Select
          value={facilityType}
          onValueChange={(value) => {
            setFacilityType(value);
            setSourceFacility('');
          }}
        >
          <SelectTrigger id="facility-type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fulfillment Center">Fulfillment Center</SelectItem>
            <SelectItem value="Sourcing Hub">Sourcing Hub</SelectItem>
            <SelectItem value="Darkstore">Darkstore</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="source-facility">Source Facility</Label>
        <Select
          value={sourceFacility}
          onValueChange={setSourceFacility}
          disabled={!facilityType || typeToFacilities[facilityType as FacilityType].length === 0}
        >
          <SelectTrigger id="source-facility">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {facilityType && typeToFacilities[facilityType as FacilityType].map((facility) => (
              <SelectItem key={facility.id} value={facility.id}>
                {facility.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="destination-facility">Destination Facility</Label>
        <Select
          value={destinationFacility}
          onValueChange={setDestinationFacility}
          disabled={!sourceFacility}
        >
          <SelectTrigger id="destination-facility">
            <SelectValue placeholder="Select destination" />
          </SelectTrigger>
          <SelectContent>
            {facilities
              .filter(f => f.id !== sourceFacility) // Exclude the source facility
              .map((facility) => (
                <SelectItem key={facility.id} value={facility.id}>
                  {facility.name} ({facility.type})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="grid-number">Grid Number</Label>
          <Input
            id="grid-number"
            value={gridNumber}
            onChange={(e) => setGridNumber(e.target.value)}
            placeholder="Enter grid #"
            disabled={!destinationFacility}
          />
        </div>
        <Button 
          onClick={handleAssignGrid} 
          disabled={!gridNumber || isSubmitting || isCheckingGrid}
          className="mb-0.5"
        >
          <Grid className="h-4 w-4 mr-2" />
          {isCheckingGrid ? 'Checking...' : 'Assign'}
        </Button>
      </div>
    </div>
  );
};

export default GridAssignmentForm;
