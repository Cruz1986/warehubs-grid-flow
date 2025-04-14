
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Facility, FacilityType } from '../GridMasterComponent';
import { toast } from 'sonner';
import GridAssignmentForm from './GridAssignmentForm';
import GridMappingsTable, { GridMapping } from './GridMappingsTable';

interface GridAssignmentProps {
  facilities: Facility[];
  isLoading: boolean;
}

const GridAssignment: React.FC<GridAssignmentProps> = ({ facilities, isLoading }) => {
  const [gridMappings, setGridMappings] = useState<GridMapping[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssignGrid = async (mapping: {
    source: string;
    sourceType: FacilityType;
    destination: string;
    destinationType: FacilityType;
    gridNumber: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      // In a real application, we would save this to the database
      // For now, we'll just add it to our local state
      const newMapping: GridMapping = {
        id: Date.now().toString(), // Use a real ID in production
        ...mapping
      };
      
      setGridMappings([...gridMappings, newMapping]);
      toast.success(`Grid ${mapping.gridNumber} assigned successfully`);
    } catch (error) {
      console.error('Error assigning grid:', error);
      toast.error('Failed to assign grid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMapping = (mappingId: string) => {
    if (window.confirm('Are you sure you want to delete this grid mapping?')) {
      setGridMappings(gridMappings.filter(m => m.id !== mappingId));
      toast.success('Grid mapping deleted successfully');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grid Assignment</CardTitle>
        <CardDescription>
          Assign grid numbers to source-destination facility pairs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">Loading facilities...</div>
        ) : facilities.length < 2 ? (
          <div className="text-center py-6 text-gray-500">
            You need at least two facilities to create a grid mapping. Please add facilities first.
          </div>
        ) : (
          <>
            <GridAssignmentForm 
              facilities={facilities} 
              onAssignGrid={handleAssignGrid}
              isSubmitting={isSubmitting}
            />
            
            <GridMappingsTable 
              gridMappings={gridMappings} 
              onDeleteMapping={handleDeleteMapping} 
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GridAssignment;
