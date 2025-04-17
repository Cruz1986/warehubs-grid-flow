
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ToteRegisterData = {
  tote_id: string;
  current_facility?: string;
  current_status?: string;
  activity?: string;
  ib_timestamp?: string;
  received_by?: string;
  grid_no?: string;
  destination?: string;
  stagged_timestamp?: string;
  staged_by?: string;
  outbound_by?: string;
  ob_timestamp?: string;
  consignment_no?: string;
  source_facility?: string;
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
      const existingTote = await getToteRegisterInfo(toteId);
      const timestamp = new Date().toISOString();
      
      if (existingTote) {
        // Update existing tote with new facility and status
        const updateData: ToteRegisterUpdateData = {
          current_status: status,
          current_facility: status === 'inbound' ? destinationFacility : sourceFacility,
          source_facility: sourceFacility,
          activity: `${status} at ${status === 'inbound' ? destinationFacility : sourceFacility}`,
          ...(status === 'inbound' ? { 
            ib_timestamp: timestamp, 
            received_by: operator 
          } : {}),
          ...(status === 'outbound' ? { 
            ob_timestamp: timestamp, 
            outbound_by: operator,
            destination: destinationFacility
          } : {})
        };

        return await updateToteRegister(toteId, updateData);
      } else {
        // Create new tote register entry
        return await createToteRegister(toteId, {
          current_status: status,
          current_facility: status === 'inbound' ? destinationFacility : sourceFacility,
          source_facility: sourceFacility,
          activity: `${status} at ${status === 'inbound' ? destinationFacility : sourceFacility}`,
          ...(status === 'inbound' ? { 
            ib_timestamp: timestamp, 
            received_by: operator 
          } : {}),
          ...(status === 'outbound' ? { 
            ob_timestamp: timestamp, 
            outbound_by: operator,
            destination: destinationFacility
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
