
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FacilityType } from '@/components/admin/GridMasterComponent';
import OutboundProcessingForm from '@/components/operations/OutboundProcessingForm';
import CurrentFacilityDisplay from '@/components/operations/CurrentFacilityDisplay';
import FacilityAccessGuard from '@/components/auth/FacilityAccessGuard';

// Type definition for Facility
interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location?: string;
}

const Outbound = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const currentFacility = user?.facility || 'Unknown';
  
  // Fetch facilities from Supabase
  useEffect(() => {
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

    fetchFacilities();
  }, []);

  // Convert facilities to the format expected by the FacilitySelector
  const facilityNames = facilities.map(facility => facility.name);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Outbound Processing</h1>
      
      <FacilityAccessGuard allowedFacility={currentFacility}>
        <CurrentFacilityDisplay facilityName={currentFacility} />
        
        <OutboundProcessingForm 
          facilities={facilityNames}
          userFacility={currentFacility}
          isLoading={isLoading}
        />
      </FacilityAccessGuard>
    </DashboardLayout>
  );
};

export default Outbound;
