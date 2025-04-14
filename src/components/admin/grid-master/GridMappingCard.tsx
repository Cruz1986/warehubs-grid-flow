
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from 'lucide-react';

interface GridMapping {
  id: string;
  source: string;
  destination: string;
  facility: string;
  gridNumbers: string[];
}

interface GridMappingCardProps {
  mapping: GridMapping;
  onEditMapping: (mapping: GridMapping) => void;
  onDeleteMapping: (mapping: GridMapping) => void;
  onDeleteGrid: (mappingId: string, gridNumber: string) => void;
}

const GridMappingCard: React.FC<GridMappingCardProps> = ({
  mapping,
  onEditMapping,
  onDeleteMapping,
  onDeleteGrid,
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-slate-50 p-4 flex justify-between items-center border-b">
        <div>
          <h3 className="text-lg font-medium">
            {mapping.source} → {mapping.destination}
          </h3>
          <p className="text-sm text-gray-500">Facility: {mapping.facility}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditMapping(mapping)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteMapping(mapping)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="font-medium mb-2">Assigned Grids</h4>
        {mapping.gridNumbers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {mapping.gridNumbers.map((grid) => (
              <div key={grid} className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-blue-700 mr-2">{grid}</span>
                <button
                  onClick={() => onDeleteGrid(mapping.id, grid)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  <Trash className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No grids assigned</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GridMappingCard;
