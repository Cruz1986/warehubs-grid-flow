
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FacilityInput from './FacilityInput';
import FacilityTypeSelector from './FacilityTypeSelector';

// Mock data for now, would be replaced with data from Supabase
const mockFacilities = ['Facility A', 'Facility B', 'Facility C', 'Facility D'];

interface GridMapping {
  id: string;
  source: string;
  destination: string;
  facility: string;
  gridNumbers: string[];
}

interface EditMappingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMapping: GridMapping | null;
  onUpdateMapping: (mapping: GridMapping) => void;
  onChangeMapping: (mapping: GridMapping) => void;
  sources: string[];
  destinations: string[];
}

const EditMappingDialog: React.FC<EditMappingDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedMapping,
  onUpdateMapping,
  onChangeMapping,
  sources,
  destinations,
}) => {
  if (!selectedMapping) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Source-Destination Mapping</DialogTitle>
          <DialogDescription>
            Update the source-destination mapping and facility.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FacilityInput
            id="edit-source"
            label="Source Facility"
            value={selectedMapping.source}
            onChange={(value) => onChangeMapping({...selectedMapping, source: value})}
            suggestions={sources}
            placeholder="Enter source facility"
          />
          
          <FacilityInput
            id="edit-destination"
            label="Destination"
            value={selectedMapping.destination}
            onChange={(value) => onChangeMapping({...selectedMapping, destination: value})}
            suggestions={destinations}
            placeholder="Enter destination"
          />
          
          <FacilityTypeSelector
            value={selectedMapping.facility}
            onChange={(value) => onChangeMapping({...selectedMapping, facility: value})}
            facilities={mockFacilities}
            label="Main Facility"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onUpdateMapping(selectedMapping)}>
            Update Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMappingDialog;
