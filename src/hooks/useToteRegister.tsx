
import { useToteInfo } from './tote/useToteInfo';
import { useToteUpdates } from './tote/useToteUpdates';
import { useToteTracking } from './tote/useToteTracking';
import { logToteError } from '@/utils/errorLogging';

export type { ToteRegisterData, ToteRegisterUpdateData } from '@/types/toteRegister';

export const useToteRegister = () => {
  const { getToteRegisterInfo, isLoading: isLoadingInfo, error: infoError } = useToteInfo();
  const { createToteRegister, updateToteRegister, isLoading: isLoadingUpdates, error: updateError } = useToteUpdates();
  const { 
    trackToteFacilityTransfer, 
    updateToteGrid, 
    updateToteConsignment,
    isLoading: isLoadingTracking,
    error: trackingError 
  } = useToteTracking();

  const isLoading = isLoadingInfo || isLoadingUpdates || isLoadingTracking;
  const error = infoError || updateError || trackingError;

  return {
    isLoading,
    error,
    getToteRegisterInfo,
    createToteRegister,
    updateToteRegister,
    trackToteFacilityTransfer,
    updateToteGrid,
    updateToteConsignment,
    logToteRegisterError: logToteError
  };
};
