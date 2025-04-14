
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FacilityInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
}

const FacilityInput: React.FC<FacilityInputProps> = ({
  id,
  label,
  value,
  onChange,
  suggestions,
  placeholder,
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={`${id}-list`}
      />
      <datalist id={`${id}-list`}>
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </div>
  );
};

export default FacilityInput;
