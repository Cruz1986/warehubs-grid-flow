
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FacilityMaster from './grid-master/FacilityMaster';
import GridAssignment from './grid-master/GridAssignment';
import { supabase } from '@/integrations/supabase/client';

export type FacilityType = 'Fulfilment_Center' | 'Sourcing_Hub' | 'Dark_Store';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location?: string;
}

interface GridMapping {
  id: string;
  source_name: string;
  destination_name: string;
  grid_no: string;
}

const GridMasterComponent = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [gridMappings, setGridMappings] = useState<GridMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('facility_master')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Ensure type is correctly mapped
      const typedFacilities = data.map(facility => ({
        id: facility.id,
        name: facility.name,
        type: facility.type as FacilityType,
        location: facility.location
      }));
      
      setFacilities(typedFacilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to load facilities');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGridMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('grid_master')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setGridMappings(data);
    } catch (error) {
      console.error('Error fetching grid mappings:', error);
      toast.error('Failed to load grid mappings');
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchGridMappings();
  }, []);

  const handleFacilityAdded = (newFacility: Facility) => {
    setFacilities([...facilities, newFacility]);
    toast.success(`${newFacility.name} added successfully`);
  };

  const handleFacilityDeleted = (facilityId: string) => {
    setFacilities(facilities.filter(f => f.id !== facilityId));
    toast.success('Facility deleted successfully');
  };

  const handleGridAssigned = (newMapping: GridMapping) => {
    setGridMappings([...gridMappings, newMapping]);
    toast.success(`Grid ${newMapping.grid_no} assigned successfully`);
  };

  const handleGridDeleted = (mappingId: string) => {
    setGridMappings(gridMappings.filter(m => m.id !== mappingId));
    toast.success('Grid mapping deleted successfully');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="facilities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="facilities">Facility Master</TabsTrigger>
          <TabsTrigger value="grid-assignment">Grid Assignment</TabsTrigger>
        </TabsList>
        <TabsContent value="facilities" className="mt-6">
          <FacilityMaster 
            facilities={facilities} 
            onFacilityAdded={handleFacilityAdded} 
            onFacilityDeleted={handleFacilityDeleted}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="grid-assignment" className="mt-6">
          <GridAssignment 
            facilities={facilities} 
            gridMappings={gridMappings}
            onGridAssigned={handleGridAssigned}
            onGridDeleted={handleGridDeleted}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GridMasterComponent;
