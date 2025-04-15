
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFacilityAdded: () => void;
}

export const AddFacilityDialog: React.FC<AddFacilityDialogProps> = ({
  open,
  onOpenChange,
  onFacilityAdded
}) => {
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [facilityLocation, setFacilityLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!facilityName || !facilityType) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('facility_master')
        .insert({
          name: facilityName,
          type: facilityType,
          location: facilityLocation || null
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success(`Facility "${data.name}" added successfully`);
      onFacilityAdded();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding facility:', error);
      toast.error(`Failed to add facility: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFacilityName('');
    setFacilityType('');
    setFacilityLocation('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Facility</DialogTitle>
          <DialogDescription>
            Enter the details for the new facility.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type*
              </Label>
              <Select value={facilityType} onValueChange={setFacilityType} required>
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Select facility type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fulfilment_Center">Fulfillment Center</SelectItem>
                  <SelectItem value="Sourcing_Hub">Sourcing Hub</SelectItem>
                  <SelectItem value="Dark_Store">Dark Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={facilityLocation}
                onChange={(e) => setFacilityLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Facility'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
