
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GridMapping {
  id: string;
  source_name: string;
  destination_name: string;
  grid_no: string;
}

interface GridMappingsTableProps {
  gridMappings: GridMapping[];
  onDeleteMapping: (id: string) => void;
  isAdmin?: boolean;
}

const GridMappingsTable: React.FC<GridMappingsTableProps> = ({ 
  gridMappings, 
  onDeleteMapping,
  isAdmin = false
}) => {
  // Get user facility from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const userFacility = user?.facility;

  // Helper to determine if user has delete permission for a mapping
  const canDeleteMapping = (mapping: GridMapping) => {
    if (isAdmin) return true;
    
    // Managers can only delete mappings related to their facility
    return userFacility === 'All' || 
           mapping.source_name === userFacility || 
           mapping.destination_name === userFacility;
  };

  if (gridMappings.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No grid mappings found. Use the Assign Grid button to create one.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Grid #</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead className="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gridMappings.map((mapping) => (
          <TableRow key={mapping.id}>
            <TableCell className="font-medium">{mapping.grid_no}</TableCell>
            <TableCell>
              {mapping.source_name === userFacility ? (
                <Badge variant="success" className="font-normal">
                  {mapping.source_name}
                </Badge>
              ) : (
                mapping.source_name
              )}
            </TableCell>
            <TableCell>
              {mapping.destination_name === userFacility ? (
                <Badge variant="success" className="font-normal">
                  {mapping.destination_name}
                </Badge>
              ) : (
                mapping.destination_name
              )}
            </TableCell>
            <TableCell>
              {canDeleteMapping(mapping) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onDeleteMapping(mapping.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default GridMappingsTable;
