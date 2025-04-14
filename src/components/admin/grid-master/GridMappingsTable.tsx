
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';

export interface GridMapping {
  id: string;
  source: string;
  sourceType: string;
  destination: string;
  destinationType: string;
  gridNumber: string;
}

interface GridMappingsTableProps {
  gridMappings: GridMapping[];
  onDeleteMapping: (mappingId: string) => void;
  onEditMapping?: (mappingId: string) => void;
}

const GridMappingsTable: React.FC<GridMappingsTableProps> = ({ 
  gridMappings, 
  onDeleteMapping,
  onEditMapping
}) => {
  if (gridMappings.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No grid mappings configured yet. Use the form above to assign grids.
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
            <TableCell>
              {mapping.source} <span className="text-xs text-gray-500">({mapping.sourceType})</span>
            </TableCell>
            <TableCell>
              {mapping.destination} <span className="text-xs text-gray-500">({mapping.destinationType})</span>
            </TableCell>
            <TableCell className="font-medium">{mapping.gridNumber}</TableCell>
            <TableCell className="flex space-x-1">
              {onEditMapping && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditMapping(mapping.id)}
                  title="Edit mapping"
                >
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
              )}
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
