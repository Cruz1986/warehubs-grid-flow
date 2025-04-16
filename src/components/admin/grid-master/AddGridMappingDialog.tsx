
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Facility } from '../GridMasterComponent';

interface GridMapping {
  id: string;
  source_name: string;
  destination_name: string;
  grid_no: string;
}

interface AddGridMappingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGridAssigned: (mapping: GridMapping) => void;
  facilities: Facility[];
  gridMappings: GridMapping[];
}

const AddGridMappingDialog: React.FC<AddGridMappingDialogProps> = ({
  isOpen,
  onOpenChange,
  onGridAssigned,
  facilities,
  gridMappings
}) => {
  const [newMapping, setNewMapping] = useState({
    source_name: '',
    destination_name: '',
    grid_no: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMapping = async () => {
    if (!newMapping.source_name || !newMapping.destination_name || !newMapping.grid_no) {
      toast.error("Please fill all required fields");
      return;
    }

    if (newMapping.source_name === newMapping.destination_name) {
      toast.error("Source and destination cannot be the same");
      return;
    }

    // Check if grid number is already in use
    const duplicateGrid = gridMappings.find(m => m.grid_no === newMapping.grid_no);
    if (duplicateGrid) {
      toast.error(`Grid number ${newMapping.grid_no} is already in use`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Insert new grid mapping into the database
      const { data, error } = await supabase
        .from('grid_master')
        .insert(newMapping)
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      // Call the parent component's callback
      onGridAssigned(data);
      
      // Close the dialog and reset the form
      resetAndClose();
    } catch (error) {
      console.error('Error adding grid mapping:', error);
      toast.error('Failed to add grid mapping');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setNewMapping({
      source_name: '',
      destination_name: '',
      grid_no: ''
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Grid Number</DialogTitle>
          <DialogDescription>
            Create a grid number mapping between source and destination facilities
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="source-facility">Source Facility</Label>
            <Select
              value={newMapping.source_name}
              onValueChange={(value) => setNewMapping({...newMapping, source_name: value})}
            >
              <SelectTrigger id="source-facility">
                <SelectValue placeholder="Select source facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.name}>
                    {facility.name} ({facility.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="destination-facility">Destination Facility</Label>
            <Select
              value={newMapping.destination_name}
              onValueChange={(value) => setNewMapping({...newMapping, destination_name: value})}
              disabled={!newMapping.source_name}
            >
              <SelectTrigger id="destination-facility">
                <SelectValue placeholder="Select destination facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities
                  .filter(f => f.name !== newMapping.source_name)
                  .map((facility) => (
                    <SelectItem key={facility.id} value={facility.name}>
                      {facility.name} ({facility.type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="grid-number">Grid Number</Label>
            <Input
              id="grid-number"
              value={newMapping.grid_no}
              onChange={(e) => setNewMapping({...newMapping, grid_no: e.target.value})}
              placeholder="Enter grid number"
              disabled={!newMapping.destination_name}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddMapping} 
            disabled={isSubmitting || !newMapping.source_name || !newMapping.destination_name || !newMapping.grid_no}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Grid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGridMappingDialog;
