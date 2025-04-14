
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ToteScanner from '../components/operations/ToteScanner';
import ToteTable from '../components/operations/ToteTable';
import FacilitySelector from '../components/operations/FacilitySelector';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FacilityType } from '@/components/admin/GridMasterComponent';

// Define the Facility interface to match what's used in the GridMasterComponent
interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location?: string;
}

const Inbound = () => {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [scannedTotes, setScannedTotes] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Fetch facilities from Supabase
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('facilities')
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
  
  const handleToteScan = (toteId: string) => {
    if (!selectedFacility) {
      toast.error("Please select a source facility first");
      return;
    }
    
    // Check if tote already scanned
    if (scannedTotes.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been scanned`);
      return;
    }
    
    // Get current timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    // Create new tote record
    const newTote = {
      id: toteId,
      status: 'inbound',
      source: selectedFacility,
      destination: user?.facility || '',
      timestamp,
      user: user?.username || 'unknown',
    };
    
    // Add to scanned totes list
    setScannedTotes([newTote, ...scannedTotes]);
    toast.success(`Tote ${toteId} has been received from ${selectedFacility}`);
    
    // In a real app, this would also save to Google Sheets
  };

  // Convert facilities to the format expected by the FacilitySelector
  const facilityNames = facilities.map(facility => facility.name);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Inbound Processing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <FacilitySelector
              facilities={facilityNames}
              selectedFacility={selectedFacility}
              onChange={setSelectedFacility}
              label="Source Facility"
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <ToteScanner onScan={handleToteScan} />
        </div>
      </div>
      
      <ToteTable
        totes={scannedTotes}
        title="Today's Inbound Totes"
      />
    </DashboardLayout>
  );
};

export default Inbound;
