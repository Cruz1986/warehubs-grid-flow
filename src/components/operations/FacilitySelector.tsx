
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building } from 'lucide-react';

interface FacilitySelectorProps {
  facilities: string[];
  selectedFacility: string;
  onChange: (facility: string) => void;
  label?: string;
}

const FacilitySelector = ({
  facilities,
  selectedFacility,
  onChange,
  label = "Select Facility"
}: FacilitySelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="facility-select" className="flex items-center">
        <Building className="h-4 w-4 mr-1" />
        {label}
      </Label>
      <Select
        value={selectedFacility}
        onValueChange={onChange}
      >
        <SelectTrigger id="facility-select" className="w-full">
          <SelectValue placeholder="Select a facility" />
        </SelectTrigger>
        <SelectContent>
          {facilities.map((facility) => (
            <SelectItem key={facility} value={facility}>
              {facility}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FacilitySelector;
