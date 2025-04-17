
import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Facility } from '../GridMasterComponent';
import { supabase } from '@/integrations/supabase/client';

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
  userFacility?: string;
}

const AddGridMappingDialog: React.FC<AddGridMappingDialogProps> = ({
  isOpen,
  onOpenChange,
  onGridAssigned,
  facilities,
  gridMappings,
  userFacility
}) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [gridNumber, setGridNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingGrids, setExistingGrids] = useState<string[]>([]);
  
  // Get user role from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Filter available facilities for source and destination
  const availableSources = isAdmin 
    ? facilities 
    : facilities.filter(f => userFacility === 'All' || f.name === userFacility);
  
  const availableDestinations = isAdmin 
    ? facilities.filter(f => f.id !== source)
    : facilities.filter(f => (userFacility === 'All' || f.name === userFacility) && f.id !== source);

  // Collect existing grid numbers for validation
  useEffect(() => {
    if (gridMappings && gridMappings.length > 0) {
      const existingNumbers = gridMappings.map(mapping => mapping.grid_no);
      setExistingGrids([...new Set(existingNumbers)]);
    }
  }, [gridMappings]);

  const handleSubmit = async () => {
    if (!source || !destination || !gridNumber.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate grid number format (alphanumeric)
    if (!/^[a-zA-Z0-9-]+$/.test(gridNumber)) {
      toast.error('Grid number must contain only letters, numbers and hyphens');
      return;
    }

    const selectedSource = facilities.find(f => f.id === source);
    const selectedDestination = facilities.find(f => f.id === destination);

    if (!selectedSource || !selectedDestination) {
      toast.error('Please select valid source and destination facilities');
      return;
    }

    // Prevent creating a grid mapping to the same facility
    if (selectedSource.name === selectedDestination.name) {
      toast.error('Source and destination cannot be the same facility');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if this exact mapping already exists
      const existingMapping = gridMappings.find(
        mapping => 
          mapping.source_name === selectedSource.name && 
          mapping.destination_name === selectedDestination.name && 
          mapping.grid_no === gridNumber
      );
      
      if (existingMapping) {
        toast.error('This exact grid mapping already exists');
        return;
      }

      const { data, error } = await supabase
        .from('grid_master')
        .insert({
          source_name: selectedSource.name,
          destination_name: selectedDestination.name,
          grid_no: gridNumber
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding grid mapping:', error);
        toast.error('Failed to add grid mapping');
        return;
      }
      
      onGridAssigned(data);
      resetForm();
      onOpenChange(false);
      toast.success('Grid mapping added successfully');
    } catch (error) {
      console.error('Error adding grid mapping:', error);
      toast.error('Failed to add grid mapping');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSource('');
    setDestination('');
    setGridNumber('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Grid Number</DialogTitle>
          <DialogDescription>
            Create a new grid mapping between source and destination facilities.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="source">Source Facility</Label>
            <Select
              value={source}
              onValueChange={setSource}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source facility" />
              </SelectTrigger>
              <SelectContent>
                {availableSources.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name} ({facility.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination Facility</Label>
            <Select
              value={destination}
              onValueChange={setDestination}
              disabled={!source}
            >
              <SelectTrigger id="destination">
                <SelectValue placeholder={source ? "Select destination facility" : "Select source first"} />
              </SelectTrigger>
              <SelectContent>
                {availableDestinations.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name} ({facility.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gridNumber">Grid Number</Label>
            <Input
              id="gridNumber"
              value={gridNumber}
              onChange={(e) => setGridNumber(e.target.value)}
              placeholder="e.g. G-123"
            />
            <p className="text-xs text-muted-foreground">
              Use a unique identifier for this source-destination pair
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Assigning...' : 'Assign Grid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGridMappingDialog;
