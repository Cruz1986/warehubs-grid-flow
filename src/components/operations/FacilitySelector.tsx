
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface FacilitySelectorProps {
  facilities: string[];
  selectedFacility: string;
  onChange: (facility: string) => void;
  label?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

const FacilitySelector: React.FC<FacilitySelectorProps> = ({ 
  facilities, 
  selectedFacility,

  onChange,
  label = "Facility",
  isLoading = false,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="facility-select">{label}</Label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select 
          value={selectedFacility} 
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id="facility-select">
            <SelectValue placeholder="Select a facility" />
          </SelectTrigger>
          <SelectContent>
            {facilities.length === 0 ? (
              <SelectItem value="none" disabled>No facilities available</SelectItem>
            ) : (
              facilities.map((facility) => (
                <SelectItem key={facility} value={facility}>
                  {facility}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default FacilitySelector;
