
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Facility, FacilityType } from '../GridMasterComponent';

interface FacilityTypeSelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  facilities: Facility[];
  facilityType?: string;
  disabled?: boolean;
  excludeId?: string;
}

const FacilityTypeSelect: React.FC<FacilityTypeSelectProps> = ({ 
  id,
  label,
  value,
  onValueChange,
  placeholder,
  facilities,
  facilityType,
  disabled = false,
  excludeId
}) => {
  // Filter facilities by type if facilityType is provided
  const filteredFacilities = facilityType 
    ? facilities.filter(f => f.type === facilityType)
    : facilities.filter(f => f.id !== excludeId); // Exclude the selected facility if excludeId is provided

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || filteredFacilities.length === 0}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredFacilities.map((facility) => (
            <SelectItem key={facility.id} value={facility.id}>
              {facility.name}{!facilityType && ` (${facility.type})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FacilityTypeSelect;
