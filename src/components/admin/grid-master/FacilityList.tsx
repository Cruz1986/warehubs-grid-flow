
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Grid2X2 } from "lucide-react";
import { Facility } from '../GridMasterComponent';

interface FacilityListProps {
  facilities: Facility[];
  isLoading: boolean;
  onFacilityAdded: () => void;
}

const FacilityList: React.FC<FacilityListProps> = ({
  facilities,
  isLoading
}) => {
  // Mapping for facility type to badge color class
  const getTypeClass = (type: string): string => {
    switch (type) {
      case 'Fulfilment_Center':
        return 'bg-blue-100 text-blue-800';
      case 'Sourcing_Hub':
        return 'bg-green-100 text-green-800';
      case 'Dark_Store':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format facility type display
  const formatType = (type: string): string => {
    return type.replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Loading facilities...</p>
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          No facilities found. Add your first facility to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {facilities.map((facility) => (
        <div 
          key={facility.id} 
          className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{facility.name}</h3>
              <Badge className={getTypeClass(facility.type)}>
                {formatType(facility.type)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Location: {facility.location || "Not specified"}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center"
            >
              <Grid2X2 className="h-4 w-4 mr-2" />
              Assign Grid
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacilityList;
