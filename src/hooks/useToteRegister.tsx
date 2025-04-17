
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  return {
    isLoading,
    error,
    getToteRegisterInfo
  };
};
