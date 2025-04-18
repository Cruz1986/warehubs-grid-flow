
import { useState } from 'react';
import { ToteRegisterUpdateData } from '@/types/toteRegister';
import { logToteError } from '@/utils/errorLogging';
import { useToteInfo } from './useToteInfo';
import { useToteUpdates } from './useToteUpdates';

export const useToteTracking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getToteRegisterInfo } = useToteInfo();
  const { updateToteRegister } = useToteUpdates();

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
      
      const existingTote = await getToteRegisterInfo(toteId);
      
      const timestamp = new Date().toISOString();
      
      let currentFacility;
      if (status === 'inbound') {
        currentFacility = destinationFacility;
      } else if (status === 'outbound' || status === 'intransit') {
        currentFacility = sourceFacility;
      } else if (status === 'staged') {
        currentFacility = sourceFacility;
      }
      
      let updateData: ToteRegisterUpdateData = {
        current_status: status,
        current_facility: currentFacility,
        source_facility: sourceFacility,
        activity: `${status} at ${currentFacility}`,
        updated_at: timestamp
      };
      
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
      
      // Preserve the consignment number if it exists
      if (existingTote?.consignment_no) {
        updateData.consignment_no = existingTote.consignment_no;
      }
      
      return await updateToteRegister(toteId, updateData);
    } catch (err) {
      console.error('Error tracking tote facility transfer:', err);
      setError('Failed to track tote movement between facilities');
      await logToteError(toteId, 'track_transfer', String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateToteGrid = async (toteId: string, gridNumber: string, facility: string, operator: string) => {
    try {
      const updateData: ToteRegisterUpdateData = {
        grid_no: gridNumber,
        current_status: 'staged',
        current_facility: facility,
        stagged_timestamp: new Date().toISOString(),
        staged_by: operator,
        activity: `Staged at grid ${gridNumber} in ${facility}`,
        staged_destination: facility
      };
      
      const existingTote = await getToteRegisterInfo(toteId);
      
      // Preserve the consignment number if it exists
      if (existingTote?.consignment_no) {
        updateData.consignment_no = existingTote.consignment_no;
      }
      
      return await updateToteRegister(toteId, updateData);
    } catch (err) {
      console.error('Error updating tote grid:', err);
      await logToteError(toteId, 'update_grid', String(err));
      return false;
    }
  };

  const updateToteConsignment = async (toteId: string, consignmentId: string, status: string = 'intransit') => {
    try {
      console.log(`Updating tote ${toteId} with consignment ${consignmentId}`);
      
      // First get the existing tote data
      const existingTote = await getToteRegisterInfo(toteId);
      
      const updateData: ToteRegisterUpdateData = {
        consignment_no: consignmentId,
        current_status: status
      };
      
      // If there's existing data, maintain it
      if (existingTote) {
        // Update the activity to reflect the consignment
        updateData.activity = `Consignment ${consignmentId} to ${existingTote.destination || 'Unknown'}`;
      }
      
      const result = await updateToteRegister(toteId, updateData);
      
      if (result) {
        console.log(`Successfully updated tote ${toteId} with consignment ${consignmentId}`);
      } else {
        console.error(`Failed to update tote ${toteId} with consignment ${consignmentId}`);
        await logToteError(toteId, 'update_consignment', `Failed to update tote register with consignment ${consignmentId}`);
      }
      
      return result;
    } catch (err) {
      console.error('Error updating tote consignment:', err);
      await logToteError(toteId, 'update_consignment', String(err));
      return false;
    }
  };

  return {
    isLoading,
    error,
    trackToteFacilityTransfer,
    updateToteGrid,
    updateToteConsignment
  };
};
