
import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Facility, FacilityType } from '../GridMasterComponent';

interface FacilityTypeSelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  facilities: Facility[];
  facilityType?: string;
  excludeId?: string;
  disabled?: boolean;
}

const FacilityTypeSelect: React.FC<FacilityTypeSelectProps> = ({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  facilities,
  facilityType,
  excludeId,
  disabled = false,
}) => {
  // Filter facilities based on type if provided
  const filteredFacilities = facilities.filter(facility => {
    if (facilityType && facility.type !== facilityType) {
      return false;
    }
    
    // Exclude the facility with excludeId if provided
    if (excludeId && facility.id === excludeId) {
      return false;
    }
    
    return true;
  });

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredFacilities.length === 0 ? (
            <div className="px-2 py-4 text-sm text-gray-500">
              No facilities available
            </div>
          ) : (
            filteredFacilities.map((facility) => (
              <SelectItem key={facility.id} value={facility.id}>
                {facility.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FacilityTypeSelect;
