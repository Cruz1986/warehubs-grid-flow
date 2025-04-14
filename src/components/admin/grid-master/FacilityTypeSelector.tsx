
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FacilityTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  facilities: string[];
  label: string;
}

const FacilityTypeSelector: React.FC<FacilityTypeSelectorProps> = ({
  value,
  onChange,
  facilities,
  label,
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="facility-type">{label}</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select facility" />
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

export default FacilityTypeSelector;
