
import { supabase } from '@/integrations/supabase/client';

export const logToteError = async (
  toteId: string, 
  operation: string, 
  errorMessage: string,
  additionalData?: Record<string, any>
) => {
  try {
    const username = localStorage.getItem('username') || 'unknown';
    
    console.log('Logging error:', {
      tote_id: toteId,
      error_message: errorMessage,
      operator: username,
      operation_type: operation,
      scan_data: {
        tote_id: toteId,
        operation,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    });
    
    const { error, data } = await supabase
      .from('scan_error_logs')
      .insert({
        tote_id: toteId,
        error_message: errorMessage,
        operator: username,
        operation_type: operation,
        scan_data: {
          tote_id: toteId,
          operation,
          timestamp: new Date().toISOString(),
          ...additionalData
        }
      });
      
    if (error) {
      console.error('Failed to log error:', error);
    } else {
      console.log('Error logged successfully:', data);
    }
  } catch (err) {
    console.error('Exception logging error:', err);
  }
};
