
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for now, would be replaced with data from Supabase
const mockFacilities = ['Facility A', 'Facility B', 'Facility C', 'Facility D'];

interface AddMappingDialogProps {
  sources: string[];
  destinations: string[];
  onAddMapping: (mapping: { source: string; destination: string; facility: string }) => void;
}

const AddMappingDialog: React.FC<AddMappingDialogProps> = ({ 
  sources, 
  destinations, 
  onAddMapping 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMapping, setNewMapping] = useState({
    source: '',
    destination: '',
    facility: '',
  });

  const handleAddMapping = () => {
    // Validate form
    if (!newMapping.source || !newMapping.destination || !newMapping.facility) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Add mapping
    onAddMapping(newMapping);
    
    // Reset form and close dialog
    setNewMapping({
      source: '',
      destination: '',
      facility: '',
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Source-Destination Mapping
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Source-Destination Mapping</DialogTitle>
          <DialogDescription>
            Create a new source to destination mapping for grid assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="source">Source Facility</Label>
            <Input
              id="source"
              value={newMapping.source}
              onChange={(e) => setNewMapping({...newMapping, source: e.target.value})}
              placeholder="Enter source facility"
              list="sources-list"
            />
            <datalist id="sources-list">
              {sources.map((source) => (
                <option key={source} value={source} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={newMapping.destination}
              onChange={(e) => setNewMapping({...newMapping, destination: e.target.value})}
              placeholder="Enter destination"
              list="destinations-list"
            />
            <datalist id="destinations-list">
              {destinations.map((destination) => (
                <option key={destination} value={destination} />
              ))}
            </datalist>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="facility">Main Facility</Label>
            <Select
              value={newMapping.facility}
              onValueChange={(value) => setNewMapping({...newMapping, facility: value})}
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddMapping}>
            Add Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMappingDialog;
