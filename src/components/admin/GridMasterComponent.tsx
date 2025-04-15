
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

const GridMasterComponent = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('Facility_Master')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Ensure type is correctly mapped
      const typedFacilities = data.map(facility => ({
        id: facility.ID,
        name: facility.Name,
        type: facility.Type as FacilityType,
        location: facility.Location
      }));
      
      setFacilities(typedFacilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to load facilities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleFacilityAdded = (newFacility: Facility) => {
    setFacilities([...facilities, newFacility]);
    toast.success(`${newFacility.name} added successfully`);
  };

  const handleFacilityDeleted = (facilityId: string) => {
    setFacilities(facilities.filter(f => f.id !== facilityId));
    toast.success('Facility deleted successfully');
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
          <GridAssignment facilities={facilities} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GridMasterComponent;
