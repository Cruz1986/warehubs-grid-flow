
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

interface GridMapping {
  id: string;
  source_name: string;
  destination_name: string;
  grid_no: string;
}

interface GridMappingsTableProps {
  gridMappings: GridMapping[];
  onDeleteMapping: (mappingId: string) => void;
}

const GridMappingsTable: React.FC<GridMappingsTableProps> = ({ 
  gridMappings, 
  onDeleteMapping
}) => {
  if (gridMappings.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No grid mappings configured yet. Use the Assign Grid button to create mappings.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source Facility</TableHead>
          <TableHead>Destination Facility</TableHead>
          <TableHead>Grid Number</TableHead>
          <TableHead className="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gridMappings.map((mapping) => (
          <TableRow key={mapping.id}>
            <TableCell>{mapping.source_name}</TableCell>
            <TableCell>{mapping.destination_name}</TableCell>
            <TableCell className="font-medium">{mapping.grid_no}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteMapping(mapping.id)}
                title="Delete mapping"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default GridMappingsTable;
