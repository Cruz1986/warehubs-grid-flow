
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface GridMapping {
  id: string;
  source: string;
  destination: string;
  facility: string;
  gridNumbers: string[];
}

interface MappingSelectorProps {
  mappings: GridMapping[];
  selectedMappingId: string;
  onSelectMapping: (mappingId: string) => void;
}

const MappingSelector: React.FC<MappingSelectorProps> = ({ 
  mappings, 
  selectedMappingId, 
  onSelectMapping 
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="mapping">Source-Destination Mapping</Label>
      <Select
        value={selectedMappingId}
        onValueChange={onSelectMapping}
      >
        <SelectTrigger id="mapping">
          <SelectValue placeholder="Select mapping" />
        </SelectTrigger>
        <SelectContent>
          {mappings.map((mapping) => (
            <SelectItem key={mapping.id} value={mapping.id}>
              {mapping.source} → {mapping.destination} ({mapping.facility})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MappingSelector;
