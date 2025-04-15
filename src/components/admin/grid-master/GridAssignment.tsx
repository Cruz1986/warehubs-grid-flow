
import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

interface GridAssignmentProps {
  facilities: Facility[];
  isLoading: boolean;
}

const GridAssignment: React.FC<GridAssignmentProps> = ({ facilities, isLoading }) => {
  const [gridMappings, setGridMappings] = useState<GridMapping[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMappings, setIsLoadingMappings] = useState(true);

  // Fetch existing grid mappings when component mounts
  useEffect(() => {
    const fetchGridMappings = async () => {
      try {
        setIsLoadingMappings(true);
        const { data, error } = await supabase
          .from('grid_mappings')
          .select('*');
        
        if (error) {
          console.error('Error fetching grid mappings:', error);
          toast.error('Failed to load grid mappings');
          return;
        }
        
        if (data) {
          const mappings: GridMapping[] = data.map(item => ({
            id: item.id,
            source: item.source,
            sourceType: item.source_type,
            destination: item.destination,
            destinationType: item.destination_type,
            gridNumber: item.grid_number
          }));
          setGridMappings(mappings);
        }
      } catch (err) {
        console.error('Error in grid mappings fetch:', err);
        toast.error('Failed to load grid mappings');
      } finally {
        setIsLoadingMappings(false);
      }
    };
    
    if (!isLoading) {
      fetchGridMappings();
    }
  }, [isLoading]);

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
      // But we've already saved it in the GridAssignmentForm component
      // We just need to add it to our local state
      const newMapping: GridMapping = {
        id: Date.now().toString(), // This ID will be replaced when we fetch the data again
        ...mapping
      };
      
      setGridMappings([...gridMappings, newMapping]);
      
      // Refresh grid mappings from database to get the actual ID
      const { data, error } = await supabase
        .from('grid_mappings')
        .select('*');
      
      if (!error && data) {
        const mappings: GridMapping[] = data.map(item => ({
          id: item.id,
          source: item.source,
          sourceType: item.source_type,
          destination: item.destination,
          destinationType: item.destination_type,
          gridNumber: item.grid_number
        }));
        setGridMappings(mappings);
      }
    } catch (error) {
      console.error('Error assigning grid:', error);
      toast.error('Failed to assign grid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (window.confirm('Are you sure you want to delete this grid mapping?')) {
      try {
        const { error } = await supabase
          .from('grid_mappings')
          .delete()
          .eq('id', mappingId);
        
        if (error) {
          console.error('Error deleting grid mapping:', error);
          toast.error('Failed to delete grid mapping');
          return;
        }
        
        setGridMappings(gridMappings.filter(m => m.id !== mappingId));
        toast.success('Grid mapping deleted successfully');
      } catch (err) {
        console.error('Error deleting grid mapping:', err);
        toast.error('Failed to delete grid mapping');
      }
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
            
            {isLoadingMappings ? (
              <div className="text-center py-6">Loading grid mappings...</div>
            ) : (
              <GridMappingsTable 
                gridMappings={gridMappings} 
                onDeleteMapping={handleDeleteMapping} 
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GridAssignment;
