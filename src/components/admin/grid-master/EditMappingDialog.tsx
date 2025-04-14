
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          <DialogTitle>Edit Grid Mapping</DialogTitle>
          <DialogDescription>
            Update the source to destination mapping.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-source">Source</Label>
            <Input
              id="edit-source"
              value={selectedMapping.source}
              onChange={(e) => onChangeMapping({...selectedMapping, source: e.target.value})}
              placeholder="Enter source"
              list="edit-sources-list"
            />
            <datalist id="edit-sources-list">
              {sources.map((source) => (
                <option key={source} value={source} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-destination">Destination</Label>
            <Input
              id="edit-destination"
              value={selectedMapping.destination}
              onChange={(e) => onChangeMapping({...selectedMapping, destination: e.target.value})}
              placeholder="Enter destination"
              list="edit-destinations-list"
            />
            <datalist id="edit-destinations-list">
              {destinations.map((destination) => (
                <option key={destination} value={destination} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-facility">Facility</Label>
            <Select
              value={selectedMapping.facility}
              onValueChange={(value) => onChangeMapping({...selectedMapping, facility: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent>
                {mockFacilities.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
