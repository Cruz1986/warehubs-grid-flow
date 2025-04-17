
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ToteRegisterData = {
  tote_id: string;
  current_facility?: string;
  current_status?: string;
  source_facility?: string;
  inbound_timestamp?: string;
  inbound_operator?: string;
  outbound_timestamp?: string;
  outbound_operator?: string;
  staged_destination?: string;
  staged_grid_no?: string;
  staged_operator?: string;
  staged_timestamp?: string;
  created_at?: string;
  updated_at?: string;
}

export type ToteRegisterUpdateData = Omit<Partial<ToteRegisterData>, 'tote_id'>;

export const useToteRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToteRegisterInfo = async (toteId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tote_register')
        .select('*')
        .eq('tote_id', toteId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching tote register info:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error in tote register fetch:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createToteRegister = async (toteId: string, registerData: ToteRegisterUpdateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('tote_register')
        .insert({ 
          tote_id: toteId,
          ...registerData 
        });
        
      if (error) {
        console.error('Error creating tote register entry:', error);
        setError(error.message);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in tote register creation:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateToteRegister = async (toteId: string, updateData: ToteRegisterUpdateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('tote_register')
        .update(updateData)
        .eq('tote_id', toteId);
        
      if (error) {
        console.error('Error updating tote register entry:', error);
        setError(error.message);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in tote register update:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Method to track tote movement between facilities
  const trackToteFacilityTransfer = async (
    toteId: string, 
    sourceFacility: string, 
    destinationFacility: string, 
    operator: string,
    status: 'inbound' | 'outbound' | 'intransit' = 'intransit'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, check if tote exists in register
      const existingTote = await getToteRegisterInfo(toteId);
      const timestamp = new Date().toISOString();
      
      // Determine if the destination facility is a staging hub
      const { data: facilityData } = await supabase
        .from('facility_master')
        .select('type')
        .eq('name', destinationFacility)
        .maybeSingle();
        
      const destinationType = facilityData?.type || 'Unknown';
      const requiresStaging = destinationType === 'FC' || destinationType === 'SH';
      
      if (existingTote) {
        // Update existing tote with new facility and status
        return await updateToteRegister(toteId, {
          current_status: status,
          current_facility: status === 'inbound' ? destinationFacility : sourceFacility,
          source_facility: sourceFacility,
          ...(status === 'inbound' ? { inbound_timestamp: timestamp, inbound_operator: operator } : {}),
          ...(status === 'outbound' ? { 
            outbound_timestamp: timestamp, 
            outbound_operator: operator, 
            staged_destination: destinationFacility,
            // Flag if staging will be required at destination
            staged_grid_no: requiresStaging ? 'Pending' : 'N/A'
          } : {})
        });
      } else {
        // Create new tote register entry
        return await createToteRegister(toteId, {
          current_status: status,
          current_facility: status === 'inbound' ? destinationFacility : sourceFacility,
          source_facility: sourceFacility,
          ...(status === 'inbound' ? { inbound_timestamp: timestamp, inbound_operator: operator } : {}),
          ...(status === 'outbound' ? { 
            outbound_timestamp: timestamp, 
            outbound_operator: operator, 
            staged_destination: destinationFacility,
            // Flag if staging will be required at destination
            staged_grid_no: requiresStaging ? 'Pending' : 'N/A'
          } : {})
        });
      }
    } catch (err) {
      console.error('Error tracking tote facility transfer:', err);
      setError('Failed to track tote movement between facilities');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getToteRegisterInfo,
    createToteRegister,
    updateToteRegister,
    trackToteFacilityTransfer
  };
};
