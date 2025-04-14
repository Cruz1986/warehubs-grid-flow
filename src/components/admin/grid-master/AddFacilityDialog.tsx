
import React, { useState } from 'react';
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
import { Facility, FacilityType } from '../GridMasterComponent';
import { supabase } from '@/integrations/supabase/client';

interface AddFacilityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFacilityAdded: (facility: Facility) => void;
}

const facilityTypes: FacilityType[] = ['Fulfillment Center', 'Sourcing Hub', 'Darkstore'];

const AddFacilityDialog: React.FC<AddFacilityDialogProps> = ({
  isOpen,
  onOpenChange,
  onFacilityAdded
}) => {
  const [newFacility, setNewFacility] = useState({
    name: '',
    type: '' as FacilityType,
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newFacility.name || !newFacility.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Ensure location has a value since it's required in the database
    if (!newFacility.location.trim()) {
      toast.error('Location is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('facilities')
        .insert({
          name: newFacility.name,
          type: newFacility.type,
          location: newFacility.location
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const addedFacility: Facility = {
        id: data.id,
        name: data.name,
        type: data.type as FacilityType,
        location: data.location
      };
      
      onFacilityAdded(addedFacility);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding facility:', error);
      toast.error('Failed to add facility');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewFacility({
      name: '',
      type: '' as FacilityType,
      location: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Facility</DialogTitle>
          <DialogDescription>
            Create a new facility for your supply chain network.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Facility Name *</Label>
            <Input
              id="name"
              value={newFacility.name}
              onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
              placeholder="Enter facility name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Facility Type *</Label>
            <Select
              value={newFacility.type}
              onValueChange={(value) => setNewFacility({...newFacility, type: value as FacilityType})}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                {facilityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={newFacility.location}
              onChange={(e) => setNewFacility({...newFacility, location: e.target.value})}
              placeholder="Enter location"
              required
            />
            <p className="text-xs text-muted-foreground">This field is required</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Facility'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFacilityDialog;
