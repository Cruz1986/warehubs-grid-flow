
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GridNumberFieldProps {
  gridNumber: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const GridNumberField: React.FC<GridNumberFieldProps> = ({ 
  gridNumber, 
  onChange, 
  disabled 
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="gridNumber">Grid Number</Label>
      <Input
        id="gridNumber"
        value={gridNumber}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter grid number"
        disabled={disabled}
      />
    </div>
  );
};

export default GridNumberField;
