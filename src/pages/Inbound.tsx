
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import CurrentFacilityDisplay from '../components/operations/CurrentFacilityDisplay';
import FacilityAccessGuard from '../components/auth/FacilityAccessGuard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FacilityType } from '@/components/admin/GridMasterComponent';
import InboundProcessingForm from '@/components/operations/InboundProcessingForm';

// Define the Facility interface to match what's used in the GridMasterComponent
interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location?: string;
}

const Inbound = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const currentFacility = user?.facility || 'Unknown';
  
  // Ensure username is stored for the components that need it
  useEffect(() => {
    if (user?.username) {
      localStorage.setItem('username', user.username);
    }
  }, [user]);
  
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
      <h1 className="text-2xl font-bold mb-6">Inbound Processing</h1>
      
      <FacilityAccessGuard allowedFacility={currentFacility}>
        <CurrentFacilityDisplay facilityName={currentFacility} />
        
        <InboundProcessingForm 
          facilities={facilityNames}
          userFacility={currentFacility}
          isLoading={isLoading}
        />
      </FacilityAccessGuard>
    </DashboardLayout>
  );
};

export default Inbound;
