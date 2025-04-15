
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ToteScanner from '../components/operations/ToteScanner';
import ToteTable from '../components/operations/ToteTable';
import FacilitySelector from '../components/operations/FacilitySelector';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FacilityType } from '@/components/admin/GridMasterComponent';
import { Loader2 } from 'lucide-react';

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

  // Fetch existing totes on load
  useEffect(() => {
    const fetchTotes = async () => {
      try {
        const { data, error } = await supabase
          .from('totes')
          .select('*, facilities(name)')
          .eq('status', 'inbound')
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) {
          console.error('Error fetching totes:', error);
          return;
        }
        
        if (data) {
          const formattedTotes = data.map(tote => ({
            id: tote.tote_number,
            status: 'inbound',
            source: tote.facilities?.name || tote.facility_id || 'Unknown',
            destination: user?.facility || '',
            timestamp: tote.created_at,
            user: user?.username || 'unknown',
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
      .channel('totes-changes')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'totes' },
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
    
    // Find the facility object
    const facilityObj = facilities.find(f => f.name === selectedFacility);
    if (!facilityObj) {
      toast.error(`Could not find facility: ${selectedFacility}`);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Insert into Supabase - but don't include scanned_by if it's not a valid UUID
      const insertData: { 
        tote_number: string; 
        status: string; 
        facility_id: string;
        scanned_by?: string | null;
      } = {
        tote_number: toteId,
        status: 'inbound',
        facility_id: facilityObj.id
      };
      
      // Only include scanned_by if user.id exists and looks like a UUID
      // UUID format: 8-4-4-4-12 hex digits (e.g., 123e4567-e89b-12d3-a456-426614174000)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (user?.id && uuidRegex.test(user.id)) {
        insertData.scanned_by = user.id;
      } else {
        console.log('User ID is not a valid UUID format. Skipping scanned_by field.');
      }
      
      const { error } = await supabase
        .from('totes')
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
    </DashboardLayout>
  );
};

export default Inbound;
