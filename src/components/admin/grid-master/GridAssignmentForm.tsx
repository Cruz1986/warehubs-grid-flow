
import React from 'react';
import { Facility, FacilityType } from '../GridMasterComponent';
import { useGridAssignment } from '@/hooks/useGridAssignment';
import FacilityTypeSelect from './FacilityTypeSelect';
import GridNumberInput from './GridNumberInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const {
    facilityType,
    sourceFacility,
    destinationFacility,
    gridNumber,
    isCheckingGrid,
    typeToFacilities,
    setFacilityType,
    setSourceFacility,
    setDestinationFacility,
    setGridNumber,
    handleAssignGrid
  } = useGridAssignment({ facilities, onAssignGrid });

  // Find the actual facility names based on IDs
  const getSourceName = () => {
    const facility = facilities.find(f => f.id === sourceFacility);
    return facility ? facility.name : '';
  };

  const getDestinationName = () => {
    const facility = facilities.find(f => f.id === destinationFacility);
    return facility ? facility.name : '';
  };

  // Get the facility type based on ID
  const getSourceType = () => {
    const facility = facilities.find(f => f.id === sourceFacility);
    return facility ? facility.type as FacilityType : 'Fulfillment Center';
  };

  const getDestinationType = () => {
    const facility = facilities.find(f => f.id === destinationFacility);
    return facility ? facility.type as FacilityType : 'Darkstore';
  };

  // Override the handleAssignGrid to use actual names instead of IDs
  const handleSubmitGrid = () => {
    handleAssignGrid({
      source: getSourceName(),
      sourceType: getSourceType(),
      destination: getDestinationName(),
      destinationType: getDestinationType(),
      gridNumber
    });
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
      
      <FacilityTypeSelect
        id="source-facility"
        label="Source Facility"
        value={sourceFacility}
        onValueChange={setSourceFacility}
        placeholder="Select source"
        facilities={facilities}
        facilityType={facilityType}
        disabled={!facilityType || typeToFacilities[facilityType as keyof typeof typeToFacilities]?.length === 0}
      />
      
      <FacilityTypeSelect
        id="destination-facility"
        label="Destination Facility"
        value={destinationFacility}
        onValueChange={setDestinationFacility}
        placeholder="Select destination"
        facilities={facilities}
        excludeId={sourceFacility}
        disabled={!sourceFacility}
      />
      
      <GridNumberInput
        value={gridNumber}
        onChange={setGridNumber}
        onAssign={handleSubmitGrid}
        disabled={!destinationFacility || isSubmitting}
        isCheckingGrid={isCheckingGrid}
      />
    </div>
  );
};

export default GridAssignmentForm;
