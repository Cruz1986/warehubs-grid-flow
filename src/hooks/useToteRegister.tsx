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
  staged_destination?: string;
}

export type ToteRegisterUpdateData = Omit<Partial<ToteRegisterData>, 'tote_id'>;

export const useToteRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get tote register info from database
   */
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
        setError(error.message);
        return null;
      }
      
      console.log(`Retrieved tote register for ${toteId}:`, data);
      return data;
    } catch (err) {
      console.error('Error in tote register fetch:', err);
      setError('Error fetching tote data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new tote register entry
   */
  const createToteRegister = async (toteId: string, registerData: ToteRegisterUpdateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add timestamp to created_at
      const dataWithTimestamp = {
        ...registerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('tote_register')
        .insert({ 
          tote_id: toteId,
          ...dataWithTimestamp 
        })
        .select();
        
      if (error) {
        console.error('Error creating tote register entry:', error);
        setError(error.message);
        return false;
      }
      
      console.log(`Created tote register for ${toteId}:`, data);
      return true;
    } catch (err) {
      console.error('Error in tote register creation:', err);
      setError('Error creating tote data');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update an existing tote register entry
   */
  const updateToteRegister = async (toteId: string, updateData: ToteRegisterUpdateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Make sure we have the existing record first
      const existingRecord = await getToteRegisterInfo(toteId);
      
      // Add updated_at timestamp
      const dataWithTimestamp = {
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      // If there's no existing record, create one instead
      if (!existingRecord) {
        console.log(`No existing register found for ${toteId}, creating new record`);
        return await createToteRegister(toteId, updateData);
      }
      
      // Update the existing record
      const { data, error } = await supabase
        .from('tote_register')
        .update(dataWithTimestamp)
        .eq('tote_id', toteId)
        .select();
        
      if (error) {
        console.error('Error updating tote register entry:', error);
        setError(error.message);
        return false;
      }
      
      console.log(`Updated tote register for ${toteId}:`, data);
      return true;
    } catch (err) {
      console.error('Error in tote register update:', err);
      setError('Error updating tote data');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Track a tote's movement between facilities
   */
  const trackToteFacilityTransfer = async (
    toteId: string, 
    sourceFacility: string, 
    destinationFacility: string, 
    operator: string,
    status: 'inbound' | 'outbound' | 'intransit' | 'staged' = 'intransit'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Tracking tote ${toteId} transfer: ${sourceFacility} -> ${destinationFacility} (${status})`);
      
      // Get existing tote data, if any
      const existingTote = await getToteRegisterInfo(toteId);
      
      // Current timestamp
      const timestamp = new Date().toISOString();
      
      // Determine the current facility based on status
      let currentFacility;
      if (status === 'inbound') {
        currentFacility = destinationFacility;
      } else if (status === 'outbound' || status === 'intransit') {
        currentFacility = sourceFacility; // Still at source until confirmed received
      } else if (status === 'staged') {
        currentFacility = sourceFacility;
      }
      
      // Create update data object based on status
      let updateData: ToteRegisterUpdateData = {
        current_status: status,
        current_facility: currentFacility,
        source_facility: sourceFacility,
        activity: `${status} at ${currentFacility}`,
        updated_at: timestamp
      };
      
      // Add specific fields based on status
      if (status === 'inbound') {
        updateData = {
          ...updateData,
          ib_timestamp: timestamp,
          received_by: operator,
        };
      } else if (status === 'outbound') {
        updateData = {
          ...updateData,
          ob_timestamp: timestamp,
          outbound_by: operator,
          destination: destinationFacility
        };
      } else if (status === 'staged') {
        updateData = {
          ...updateData,
          stagged_timestamp: timestamp,
          staged_by: operator,
        };
      }
      
      if (existingTote) {
        // Update existing tote with new status information
        console.log(`Updating existing tote ${toteId} in register with:`, updateData);
        return await updateToteRegister(toteId, updateData);
      } else {
        // Create new tote register entry
        console.log(`Creating new tote ${toteId} in register with:`, updateData);
        return await createToteRegister(toteId, updateData);
      }
    } catch (err) {
      console.error('Error tracking tote facility transfer:', err);
      setError('Failed to track tote movement between facilities');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update a tote's grid location
   */
  const updateToteGrid = async (toteId: string, gridNumber: string, facility: string, operator: string) => {
    try {
      // Get current tote data
      const currentData = await getToteRegisterInfo(toteId);
      
      // Update with grid information
      const updateData: ToteRegisterUpdateData = {
        grid_no: gridNumber,
        current_status: 'staged',
        current_facility: facility,
        stagged_timestamp: new Date().toISOString(),
        staged_by: operator,
        activity: `Staged at grid ${gridNumber} in ${facility}`,
        staged_destination: facility
      };
      
      if (currentData) {
        return await updateToteRegister(toteId, updateData);
      } else {
        return await createToteRegister(toteId, updateData);
      }
    } catch (err) {
      console.error('Error updating tote grid:', err);
      await logToteRegisterError(toteId, 'updateToteGrid', String(err));
      return false;
    }
  };

  /**
   * Log errors related to tote register operations
   */
  const logToteRegisterError = async (toteId: string, operation: string, errorMessage: string) => {
    try {
      const username = localStorage.getItem('username') || 'unknown';
      
      const { error } = await supabase
        .from('scan_error_logs')
        .insert({
          tote_id: toteId,
          error_message: errorMessage,
          operator: username,
          operation_type: operation,
          scan_data: { 
            tote_id: toteId,
            operation: operation,
            timestamp: new Date().toISOString()
          }
        });
      
      if (error) {
        console.error('Failed to log tote register error:', error);
      }
    } catch (err) {
      console.error('Exception logging tote register error:', err);
    }
  };

  /**
   * Update a tote's consignment association
   */
  const updateToteConsignment = async (toteId: string, consignmentId: string, status: string = 'intransit') => {
    // Get current tote data
    const currentData = await getToteRegisterInfo(toteId);
    
    // Update with consignment information
    const updateData: ToteRegisterUpdateData = {
      consignment_no: consignmentId,
      current_status: status
    };
    
    if (currentData) {
      return await updateToteRegister(toteId, updateData);
    } else {
      return await createToteRegister(toteId, {
        ...updateData,
        tote_id: toteId
      });
    }
  };

  return {
    isLoading,
    error,
    getToteRegisterInfo,
    createToteRegister,
    updateToteRegister,
    trackToteFacilityTransfer,
    updateToteGrid,
    updateToteConsignment,
    logToteRegisterError
  };
};
