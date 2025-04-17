
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ToteRegisterData } from '@/types/toteRegister';
import { logToteError } from '@/utils/errorLogging';

export const useToteInfo = () => {
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
        setError(error.message);
        await logToteError(toteId, 'fetch_info', error.message);
        return null;
      }
      
      console.log(`Retrieved tote register for ${toteId}:`, data);
      return data;
    } catch (err) {
      console.error('Error in tote register fetch:', err);
      setError('Error fetching tote data');
      await logToteError(toteId, 'fetch_info', String(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getToteRegisterInfo
  };
};
