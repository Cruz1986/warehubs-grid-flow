
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GridNumberFieldProps {
  gridNumber: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  validGrids?: string[];
  error?: string;
}

const GridNumberField: React.FC<GridNumberFieldProps> = ({ 
  gridNumber, 
  onChange, 
  disabled,
  validGrids,
  error
}) => {
  const isValid = !validGrids || validGrids.length === 0 || !gridNumber || validGrids.includes(gridNumber);

  return (
    <div className="grid gap-2">
      <Label htmlFor="gridNumber">Grid Number</Label>
      <Input
        id="gridNumber"
        value={gridNumber}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter grid number"
        disabled={disabled}
        className={!isValid || error ? "border-red-500" : ""}
      />
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        !isValid && (
          <p className="text-sm text-red-500">Grid number is not valid</p>
        )
      )}
    </div>
  );
};

export default GridNumberField;
