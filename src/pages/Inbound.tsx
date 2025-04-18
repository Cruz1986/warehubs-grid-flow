
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InboundProcessingForm from '@/components/operations/InboundProcessingForm';
import ConsignmentReceiver from '@/components/operations/consignment/ConsignmentReceiver';
import ToteSearch from '@/components/operations/ToteSearch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FacilityType } from '@/components/admin/GridMasterComponent';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Type definition for Facility
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
  const isAdmin = user?.role === 'Admin';
  
  console.log('Inbound page - Current facility:', currentFacility, 'isAdmin:', isAdmin);
  console.log('User info:', user);
  
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
        console.log('Fetched facilities:', typedFacilities);
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
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Inbound Operations</h1>
        
        <Tabs defaultValue="inbound" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inbound">Inbound Processing</TabsTrigger>
            <TabsTrigger value="consignments">Consignments</TabsTrigger>
            <TabsTrigger value="search">Tote Search</TabsTrigger>
          </TabsList>

          <TabsContent value="inbound">
            <InboundProcessingForm 
              facilities={facilityNames}
              userFacility={currentFacility}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="consignments">
            <ConsignmentReceiver 
              currentFacility={currentFacility} 
              isAdmin={isAdmin}
            />
          </TabsContent>

          <TabsContent value="search">
            <ToteSearch />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Inbound;
