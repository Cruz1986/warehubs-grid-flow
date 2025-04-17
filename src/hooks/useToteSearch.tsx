
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ToteRegisterData } from './useToteRegister';
import { AlertTriangle } from 'lucide-react';

export interface ToteHistory {
  activity: string;
  timestamp: string;
  facility: string;
  operator?: string;
  status?: string;
}

export const useToteSearch = () => {
  const [searchResult, setSearchResult] = useState<ToteRegisterData | null>(null);
  const [toteHistory, setToteHistory] = useState<ToteHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const logSearchError = async (toteId: string, errorMessage: string) => {
    try {
      const username = localStorage.getItem('username') || 'unknown';
      
      const { error } = await supabase
        .from('scan_error_logs')
        .insert({
          tote_id: toteId,
          error_message: errorMessage,
          operator: username,
          operation_type: 'search',
          scan_data: { 
            tote_id: toteId,
            operation: 'search',
            timestamp: new Date().toISOString()
          }
        });
        
      if (error) {
        console.error('Error logging search error:', error);
      }
    } catch (err) {
      console.error('Exception logging search error:', err);
    }
  };

  const searchTote = async (toteId: string) => {
    if (!toteId || toteId.trim() === '') {
      toast.error('Please enter a valid tote ID');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    setSearchResult(null);
    setToteHistory([]);
    
    try {
      console.log('Searching for tote:', toteId);
      
      // Query all tables independently to find any record of the tote
      const [registerData, inboundData, outboundData, stagingData] = await Promise.all([
        // 1. Check tote_register first
        supabase
          .from('tote_register')
          .select('*')
          .eq('tote_id', toteId)
          .maybeSingle(),
          
        // 2. Check tote_inbound table
        supabase
          .from('tote_inbound')
          .select('*')
          .eq('tote_id', toteId),
          
        // 3. Check tote_outbound table
        supabase
          .from('tote_outbound')
          .select('*')
          .eq('tote_id', toteId),
          
        // 4. Check tote_staging table
        supabase
          .from('tote_staging')
          .select('*')
          .eq('tote_id', toteId)
      ]);
      
      // If we have any data in any of the tables, the tote exists
      const toteExistsInAnyTable = (
        (registerData.data !== null) || 
        (inboundData.data && inboundData.data.length > 0) || 
        (outboundData.data && outboundData.data.length > 0) || 
        (stagingData.data && stagingData.data.length > 0)
      );
      
      console.log('Tote exists in any table:', toteExistsInAnyTable);
      console.log('Register data:', registerData.data);
      console.log('Inbound data:', inboundData.data);
      console.log('Outbound data:', outboundData.data);
      console.log('Staging data:', stagingData.data);
      
      if (!toteExistsInAnyTable) {
        setNotFound(true);
        console.log('Tote not found in any tables:', toteId);
        return null;
      }
      
      // If the tote exists in any table but not in register, create a basic result object
      let currentData = registerData.data;
      
      if (!currentData && toteExistsInAnyTable) {
        // Create a synthetic record from the available data with all required properties
        // Fixed: All properties are properly marked as optional with default values where needed
        let syntheticData: ToteRegisterData = {
          tote_id: toteId,  // Only tote_id is required by the type
          current_status: 'unknown',
          activity: 'Unknown activity',  // Provide a default for activity
          current_facility: null,
          source_facility: null,
          destination: null,
          grid_no: null,
          consignment_no: null,  // Fixed: Initialize as null since it's optional
          created_at: new Date().toISOString(),
          ib_timestamp: null,
          ob_timestamp: null,
          outbound_by: null,
          received_by: null,
          staged_by: null,
          staged_destination: null,
          stagged_timestamp: null,
          updated_at: new Date().toISOString()
        };
        
        // Try to populate from inbound
        if (inboundData.data && inboundData.data.length > 0) {
          const latest = inboundData.data[0];
          syntheticData.current_status = latest.status;
          syntheticData.current_facility = latest.current_facility;
          syntheticData.source_facility = latest.source;
          syntheticData.ib_timestamp = latest.timestamp_in;
          syntheticData.received_by = latest.operator_name;
          syntheticData.activity = `Inbound at ${latest.current_facility || 'Unknown'}`;
        }
        
        // Try to populate from outbound
        if (outboundData.data && outboundData.data.length > 0) {
          const latest = outboundData.data[0];
          syntheticData.destination = latest.destination;
          syntheticData.staged_destination = latest.destination; // Ensure staged_destination is set
          syntheticData.ob_timestamp = latest.timestamp_out;
          syntheticData.outbound_by = latest.operator_name;
          syntheticData.consignment_no = latest.consignment_id;
          // Only update activity if it's more recent than inbound
          if (!syntheticData.ib_timestamp || (syntheticData.ob_timestamp && new Date(syntheticData.ob_timestamp) > new Date(syntheticData.ib_timestamp))) {
            syntheticData.activity = `Outbound to ${latest.destination}`;
          }
        }
        
        // Try to populate from staging
        if (stagingData.data && stagingData.data.length > 0) {
          const latest = stagingData.data[0];
          syntheticData.grid_no = latest.grid_no;
          syntheticData.stagged_timestamp = latest.grid_timestamp;
          syntheticData.staged_by = latest.operator_name;
          syntheticData.staged_destination = latest.destination;
          // Only update activity if it's the most recent
          const stagingDate = new Date(latest.grid_timestamp);
          const inboundDate = syntheticData.ib_timestamp ? new Date(syntheticData.ib_timestamp) : null;
          const outboundDate = syntheticData.ob_timestamp ? new Date(syntheticData.ob_timestamp) : null;
          if ((!inboundDate || stagingDate > inboundDate) && (!outboundDate || stagingDate > outboundDate)) {
            syntheticData.activity = `Staged at grid ${latest.grid_no}`;
          }
        }
        
        currentData = syntheticData;
        
        // Try to save this synthetic record to tote_register for future reference
        try {
          const { error: registerError } = await supabase
            .from('tote_register')
            .insert(currentData);
            
          if (registerError) {
            console.warn('Could not create tote register entry:', registerError);
            await logSearchError(toteId, `Failed to create register entry: ${registerError.message}`);
          }
        } catch (registerErr) {
          console.error('Exception creating register entry:', registerErr);
          await logSearchError(toteId, `Exception creating register: ${String(registerErr)}`);
        }
      }

      setSearchResult(currentData);
      console.log('Tote found:', currentData);

      // Fetch tote history from all relevant tables
      const history: ToteHistory[] = [
        ...(inboundData.data?.map(entry => ({
          activity: 'Inbound',
          timestamp: entry.timestamp_in,
          facility: entry.current_facility || 'Unknown',
          operator: entry.operator_name,
          status: entry.status
        })) || []),
        ...(outboundData.data?.map(entry => ({
          activity: 'Outbound',
          timestamp: entry.timestamp_out,
          facility: entry.destination,
          operator: entry.operator_name,
          status: entry.status
        })) || []),
        ...(stagingData.data?.map(entry => ({
          activity: `Staged at grid ${entry.grid_no}`,
          timestamp: entry.grid_timestamp,
          facility: entry.staging_facility || 'Unknown',
          operator: entry.operator_name,
          status: entry.status
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      console.log('History data compiled:', history);
      setToteHistory(history);
      return currentData;
    } catch (err) {
      console.error('Error in tote search:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to search for tote');
      await logSearchError(toteId, `Search exception: ${String(err)}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchResult,
    toteHistory,
    isLoading,
    error,
    notFound,
    searchTote
  };
};
