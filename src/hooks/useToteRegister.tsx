
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

  const updateToteRegister = async (
    toteId: string, 
    updates: { 
      current_status?: string;
      current_facility?: string;
      inbound_timestamp?: string;
      inbound_operator?: string;
      outbound_timestamp?: string;
      outbound_operator?: string;
      staged_timestamp?: string;
      staged_operator?: string;
      staged_grid_no?: string;
      staged_destination?: string;
      source_facility?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tote_register')
        .update(updates)
        .eq('tote_id', toteId)
        .select()
        .maybeSingle();
        
      if (error) {
        console.error('Error updating tote register:', error);
        setError(`Failed to update tote register: ${error.message}`);
        toast.error('Failed to update tote register');
        return null;
      }
      
      return data;
    } catch (err: any) {
      console.error('Error processing tote register update:', err);
      setError(`Error: ${err.message}`);
      toast.error('Failed to process tote register update');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createToteRegister = async (
    toteId: string,
    data: {
      current_status: string;
      current_facility: string;
      source_facility?: string;
      inbound_timestamp?: string;
      inbound_operator?: string;
      outbound_timestamp?: string;
      outbound_operator?: string;
      staged_destination?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if tote already exists
      const { data: existingTote } = await supabase
        .from('tote_register')
        .select('tote_id')
        .eq('tote_id', toteId)
        .maybeSingle();
        
      if (existingTote) {
        // Tote exists, update it instead
        return await updateToteRegister(toteId, data);
      }
      
      // Create new tote register entry
      const { data: newTote, error } = await supabase
        .from('tote_register')
        .insert({
          tote_id: toteId,
          ...data
        })
        .select()
        .maybeSingle();
        
      if (error) {
        console.error('Error creating tote register:', error);
        setError(`Failed to create tote register: ${error.message}`);
        toast.error('Failed to create tote register');
        return null;
      }
      
      return newTote;
    } catch (err: any) {
      console.error('Error processing tote register creation:', err);
      setError(`Error: ${err.message}`);
      toast.error('Failed to process tote register creation');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getToteRegisterInfo,
    updateToteRegister,
    createToteRegister
  };
};
