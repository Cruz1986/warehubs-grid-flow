
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

// Define the grid_mappings table schema
interface GridMappingRow {
  id: string;
  source: string;
  source_type: string;
  destination: string;
  destination_type: string;
  grid_number: string;
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
        
        // Check if grid_mappings table exists first
        const { data: tableExists } = await supabase
          .from('grid_master')
          .select('*')
          .limit(1);
          
        if (tableExists) {
          // Use grid_master table instead
          const { data, error } = await supabase
            .from('grid_master')
            .select('*');
          
          if (error) {
            console.error('Error fetching grid mappings:', error);
            toast.error('Failed to load grid mappings');
            return;
          }
          
          if (data) {
            const mappings: GridMapping[] = data.map(item => ({
              id: item.id,
              source: item.source_name,
              sourceType: 'Fulfillment Center', // Default value as it's not in the schema
              destination: item.destination_name,
              destinationType: 'Darkstore', // Default value as it's not in the schema
              gridNumber: item.grid_no
            }));
            setGridMappings(mappings);
          }
        } else {
          setGridMappings([]);
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
      
      // Insert into grid_master table
      const { data, error } = await supabase
        .from('grid_master')
        .insert([
          {
            source_name: mapping.source,
            destination_name: mapping.destination,
            grid_no: mapping.gridNumber
          }
        ])
        .select();
      
      if (error) {
        console.error('Error assigning grid:', error);
        toast.error('Failed to assign grid');
        return;
      }
      
      if (data && data.length > 0) {
        const newMapping: GridMapping = {
          id: data[0].id,
          source: data[0].source_name,
          sourceType: mapping.sourceType,
          destination: data[0].destination_name,
          destinationType: mapping.destinationType,
          gridNumber: data[0].grid_no
        };
        
        setGridMappings([...gridMappings, newMapping]);
        toast.success('Grid assigned successfully');
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
          .from('grid_master')
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
