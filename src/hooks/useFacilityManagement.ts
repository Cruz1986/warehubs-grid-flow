
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Facility, FacilityType } from '@/components/admin/GridMasterComponent';

export const useFacilityManagement = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
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

  return {
    facilities,
    isLoading,
    handleFacilityAdded,
    handleFacilityDeleted
  };
};
