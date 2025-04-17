
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ToteRegisterData, ToteRegisterUpdateData } from '@/types/toteRegister';
import { logToteError } from '@/utils/errorLogging';
import { useToteInfo } from './useToteInfo';

export const useToteUpdates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToteRegisterInfo } = useToteInfo();

  const createToteRegister = async (toteId: string, registerData: ToteRegisterUpdateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
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
        await logToteError(toteId, 'create', error.message);
        return false;
      }
      
      console.log(`Created tote register for ${toteId}:`, data);
      return true;
    } catch (err) {
      console.error('Error in tote register creation:', err);
      setError('Error creating tote data');
      await logToteError(toteId, 'create', String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateToteRegister = async (toteId: string, updateData: ToteRegisterUpdateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const existingRecord = await getToteRegisterInfo(toteId);
      
      const dataWithTimestamp = {
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      if (!existingRecord) {
        console.log(`No existing register found for ${toteId}, creating new record`);
        return await createToteRegister(toteId, updateData);
      }
      
      const { data, error } = await supabase
        .from('tote_register')
        .update(dataWithTimestamp)
        .eq('tote_id', toteId)
        .select();
        
      if (error) {
        console.error('Error updating tote register entry:', error);
        setError(error.message);
        await logToteError(toteId, 'update', error.message);
        return false;
      }
      
      console.log(`Updated tote register for ${toteId}:`, data);
      return true;
    } catch (err) {
      console.error('Error in tote register update:', err);
      setError('Error updating tote data');
      await logToteError(toteId, 'update', String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createToteRegister,
    updateToteRegister
  };
};
