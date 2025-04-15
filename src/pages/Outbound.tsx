
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ToteScanner from '../components/operations/ToteScanner';
import ToteTable from '../components/operations/ToteTable';
import FacilitySelector from '../components/operations/FacilitySelector';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FacilityType } from '@/components/admin/GridMasterComponent';

// Type definition for Facility
interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location?: string;
}

const Outbound = () => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [outboundTotes, setOutboundTotes] = useState<any[]>([]);
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
          .from('tote_outbound')
          .select('*')
          .eq('status', 'outbound')
          .order('timestamp_out', { ascending: false })
          .limit(50);
          
        if (error) {
          console.error('Error fetching totes:', error);
          return;
        }
        
        if (data) {
          const formattedTotes = data.map(tote => ({
            id: tote.tote_id,
            status: 'outbound',
            source: user?.facility || '',
            destination: tote.destination,
            timestamp: tote.timestamp_out,
            user: tote.operator_name || 'unknown',
          }));
          
          setOutboundTotes(formattedTotes);
        }
      } catch (error) {
        console.error('Error fetching totes:', error);
      }
    };
    
    fetchTotes();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('totes-outbound-changes')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'tote_outbound' },
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
    if (!selectedDestination) {
      toast.error("Please select a destination facility first");
      return;
    }
    
    // Check if tote already processed
    if (outboundTotes.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been processed for outbound`);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Check if tote exists and is staged for the selected destination
      const { data: stagedTotes, error: stagedError } = await supabase
        .from('tote_staging')
        .select('*')
        .eq('tote_id', toteId)
        .eq('status', 'staged')
        .maybeSingle();
        
      if (stagedError) {
        toast.error(`Error verifying tote status: ${stagedError.message}`);
        setIsSaving(false);
        return;
      }
      
      if (!stagedTotes) {
        toast.error(`Tote ${toteId} is not staged for outbound processing`);
        setIsSaving(false);
        return;
      }
      
      // Check if tote is staged for the correct destination
      if (stagedTotes.destination !== selectedDestination) {
        toast.error(`Tote ${toteId} is staged for ${stagedTotes.destination}, not ${selectedDestination}`);
        setIsSaving(false);
        return;
      }
      
      // Insert into outbound
      const insertData = {
        tote_id: toteId,
        status: 'outbound',
        destination: selectedDestination,
        operator_name: user?.username || 'unknown'
      };
      
      const { error: insertError } = await supabase
        .from('tote_outbound')
        .insert(insertData);
        
      if (insertError) {
        console.error('Error saving outbound tote:', insertError);
        toast.error(`Failed to save outbound tote: ${insertError.message}`);
        setIsSaving(false);
        return;
      }
      
      // Update staging status
      const { error: updateError } = await supabase
        .from('tote_staging')
        .update({ status: 'shipped' })
        .eq('tote_id', toteId);
        
      if (updateError) {
        console.error('Error updating staging status:', updateError);
        // Don't block the process since the outbound record was created
        toast.warning('Tote marked as outbound but staging status update failed');
      }
      
      // Success! The tote will be added to the list via the realtime subscription
      toast.success(`Tote ${toteId} has been shipped to ${selectedDestination}`);
    } catch (err) {
      console.error('Exception processing outbound tote:', err);
      toast.error('An unexpected error occurred while processing the tote');
    } finally {
      setIsSaving(false);
    }
  };

  // Convert facilities to the format expected by the FacilitySelector
  const facilityNames = facilities.map(facility => facility.name);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Outbound Processing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <FacilitySelector
              facilities={facilityNames}
              selectedFacility={selectedDestination}
              onChange={setSelectedDestination}
              label="Destination Facility"
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <ToteScanner 
            onScan={handleToteScan}
            placeholder="Scan tote for outbound"
            isLoading={isSaving}
          />
        </div>
      </div>
      
      <ToteTable
        totes={outboundTotes}
        title="Today's Outbound Totes"
        isLoading={isLoading}
      />
    </DashboardLayout>
  );
};

export default Outbound;
