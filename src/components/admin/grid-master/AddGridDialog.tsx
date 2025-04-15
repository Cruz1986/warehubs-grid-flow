
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Facility {
  id: string;
  name: string;
  type: string;
  location?: string | null;
}

interface AddGridDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGridAdded: (mappingId: string, gridNumber: string) => void;
  facilities: Facility[];
}

const AddGridDialog: React.FC<AddGridDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onGridAdded,
  facilities
}) => {
  const [sourceFacility, setSourceFacility] = useState('');
  const [destinationFacility, setDestinationFacility] = useState('');
  const [gridNumber, setGridNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddGrid = async () => {
    if (!sourceFacility || !destinationFacility || !gridNumber) {
      toast.error("Please select source, destination and enter a grid number");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get facility names based on selected IDs
      const sourceObj = facilities.find(f => f.id === sourceFacility);
      const destObj = facilities.find(f => f.id === destinationFacility);
      
      if (!sourceObj || !destObj) {
        toast.error("Invalid selection");
        setIsSubmitting(false);
        return;
      }
      
      // Insert into grid_master table
      const { data, error } = await supabase
        .from('grid_master')
        .insert([
          {
            source_name: sourceObj.name,
            destination_name: destObj.name,
            grid_no: gridNumber
          }
        ])
        .select();
      
      if (error) {
        console.error('Error assigning grid:', error);
        if (error.code === '23505') {
          toast.error(`This grid mapping already exists`);
        } else {
          toast.error('Failed to assign grid');
        }
        setIsSubmitting(false);
        return;
      }
      
      if (data && data.length > 0) {
        // Call onGridAdded with the new grid data
        onGridAdded(data[0].id, gridNumber);
        
        // Reset form fields
        setSourceFacility('');
        setDestinationFacility('');
        setGridNumber('');
        
        // Close the dialog
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error assigning grid:', error);
      toast.error('Failed to assign grid');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Grid</DialogTitle>
          <DialogDescription>
            Assign a grid number to a source-destination pair
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="source">Source Facility</Label>
            <Select
              value={sourceFacility}
              onValueChange={setSourceFacility}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name} ({facility.type.replace('_', ' ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination Facility</Label>
            <Select
              value={destinationFacility}
              onValueChange={setDestinationFacility}
              disabled={!sourceFacility}
            >
              <SelectTrigger id="destination">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {facilities
                  .filter(f => f.id !== sourceFacility)
                  .map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name} ({facility.type.replace('_', ' ')})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="gridNumber">Grid Number</Label>
            <Input
              id="gridNumber"
              placeholder="Enter grid number"
              value={gridNumber}
              onChange={(e) => setGridNumber(e.target.value)}
              disabled={!destinationFacility}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddGrid} 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Adding..." : "Add Grid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGridDialog;
