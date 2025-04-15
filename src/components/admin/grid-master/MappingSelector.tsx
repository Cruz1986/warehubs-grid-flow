
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
  label?: string;
}

const MappingSelector: React.FC<MappingSelectorProps> = ({ 
  mappings = [], // Provide a default empty array to prevent map errors
  selectedMappingId, 
  onSelectMapping,
  label = "Source-Destination Mapping"
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="mapping">{label}</Label>
      <Select
        value={selectedMappingId}
        onValueChange={onSelectMapping}
      >
        <SelectTrigger id="mapping">
          <SelectValue placeholder="Select mapping" />
        </SelectTrigger>
        <SelectContent>
          {Array.isArray(mappings) ? (
            mappings.length > 0 ? (
              mappings.map((mapping) => (
                <SelectItem key={mapping.id} value={mapping.id}>
                  {mapping.source} → {mapping.destination} ({mapping.facility})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-mappings" disabled>
                No mappings available
              </SelectItem>
            )
          ) : (
            <SelectItem value="error" disabled>
              Error loading mappings
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MappingSelector;
