
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
      
      if (existingTote) {
        return await updateToteRegister(toteId, updateData);
      } else {
        return await updateToteRegister(toteId, updateData);
      }
    } catch (err) {
      console.error('Error updating tote grid:', err);
      await logToteError(toteId, 'update_grid', String(err));
      return false;
    }
  };

  const updateToteConsignment = async (toteId: string, consignmentId: string, status: string = 'intransit') => {
    const updateData: ToteRegisterUpdateData = {
      consignment_no: consignmentId,
      current_status: status
    };
    
    return await updateToteRegister(toteId, updateData);
  };

  return {
    isLoading,
    error,
    trackToteFacilityTransfer,
    updateToteGrid,
    updateToteConsignment
  };
};
