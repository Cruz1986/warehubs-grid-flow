
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ToteScanner from '../components/operations/ToteScanner';
import ToteTable from '../components/operations/ToteTable';
import FacilitySelector from '../components/operations/FacilitySelector';
import CurrentFacilityDisplay from '../components/operations/CurrentFacilityDisplay';
import FacilityAccessGuard from '../components/auth/FacilityAccessGuard';
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
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Fetch existing totes on load
  useEffect(() => {
    const fetchTotes = async () => {
      try {
        const { data, error } = await supabase
          .from('tote_inbound')
          .select('*')
          .eq('status', 'inbound')
          .order('timestamp_in', { ascending: false })
          .limit(50);
          
        if (error) {
          console.error('Error fetching totes:', error);
          return;
        }
        
        if (data) {
          const formattedTotes = data.map(tote => ({
            id: tote.tote_id,
            status: 'inbound',
            source: tote.source || 'Unknown',
            destination: user?.facility || '',
            timestamp: tote.timestamp_in,
            user: tote.operator_name || 'unknown',
          }));
          
          setScannedTotes(formattedTotes);
        }
      } catch (error) {
        console.error('Error fetching totes:', error);
      }
    };
    
    fetchTotes();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('totes-inbound-changes')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'tote_inbound' },
          (payload) => {
            fetchTotes();
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.facility, user?.username]);
  
  const handleToteScan = async (toteId: string) => {
    if (!selectedFacility) {
      toast.error("Please select a source facility first");
      return;
    }
    
    // Check if tote already scanned
    if (scannedTotes.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been scanned`);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Insert into Supabase
      const insertData = {
        tote_id: toteId,
        status: 'inbound',
        source: selectedFacility,
        operator_name: user?.username || 'unknown'
      };
      
      const { error } = await supabase
        .from('tote_inbound')
        .insert(insertData);
        
      if (error) {
        console.error('Error saving tote:', error);
        toast.error(`Failed to save tote: ${error.message}`);
        return;
      }
      
      // Success! The tote will be added to the list via the realtime subscription
      toast.success(`Tote ${toteId} has been received from ${selectedFacility}`);
    } catch (err) {
      console.error('Exception saving tote:', err);
      toast.error('An unexpected error occurred while saving the tote');
    } finally {
      setIsSaving(false);
    }
  };

  // Convert facilities to the format expected by the FacilitySelector
  const facilityNames = facilities.map(facility => facility.name);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Inbound Processing</h1>
      
      <FacilityAccessGuard allowedFacility={currentFacility}>
        <CurrentFacilityDisplay facilityName={currentFacility} />
        
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
            <ToteScanner 
              onScan={handleToteScan} 
              isLoading={isSaving}
            />
          </div>
        </div>
        
        <ToteTable
          totes={scannedTotes}
          title="Today's Inbound Totes"
          isLoading={isLoading}
        />
      </FacilityAccessGuard>
    </DashboardLayout>
  );
};

export default Inbound;
