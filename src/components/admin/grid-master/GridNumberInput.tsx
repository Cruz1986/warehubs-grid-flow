
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Grid } from 'lucide-react';

interface GridNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onAssign: () => void;
  disabled?: boolean;
  isCheckingGrid?: boolean;
}

const GridNumberInput: React.FC<GridNumberInputProps> = ({ 
  value, 
  onChange, 
  onAssign,
  disabled = false,
  isCheckingGrid = false
}) => {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor="grid-number">Grid Number</Label>
        <Input
          id="grid-number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter grid #"
          disabled={disabled}
        />
      </div>
      <Button 
        onClick={onAssign} 
        disabled={!value || disabled || isCheckingGrid}
        className="mb-0.5"
      >
        <Grid className="h-4 w-4 mr-2" />
        {isCheckingGrid ? 'Checking...' : 'Assign'}
      </Button>
    </div>
  );
};

export default GridNumberInput;
