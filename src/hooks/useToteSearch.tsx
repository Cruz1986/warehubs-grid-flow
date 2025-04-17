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

// Modified search result type to handle optional properties
export interface ToteSearchResult {
  tote_id: string;
  activity: string;
  consignment_no?: string | null;
  created_at?: string | null;
  current_facility?: string | null;
  current_status?: string | null;
  destination?: string | null;
  grid_no?: string | null;
  ib_timestamp?: string | null;
  ob_timestamp?: string | null;
  source_facility?: string | null;
  updated_at?: string | null;
}

export const useToteSearch = () => {
  const [searchResult, setSearchResult] = useState<ToteSearchResult | null>(null);
  const [toteHistory, setToteHistory] = useState<ToteHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

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
      
      if (!toteExistsInAnyTable) {
        setNotFound(true);
        console.log('Tote not found in any tables:', toteId);
        return null;
      }
      
      // Construct the search result
      const resultData: ToteSearchResult = {
        tote_id: toteId,
        activity: '',
        consignment_no: null,
        created_at: null,
        current_facility: null,
        current_status: null,
        destination: null,
        grid_no: null,
        ib_timestamp: null,
        ob_timestamp: null,
        source_facility: null,
        updated_at: null
      };
      
      // Populate with register data if available
      if (registerData.data) {
        Object.assign(resultData, registerData.data);
      }
      
      // Priority order for populating fields
      if (inboundData.data && inboundData.data.length > 0) {
        const latest = inboundData.data[0];
        resultData.current_status = resultData.current_status || 'inbound';
        resultData.current_facility = resultData.current_facility || latest.current_facility;
        resultData.source_facility = resultData.source_facility || latest.source;
        resultData.ib_timestamp = latest.timestamp_in || resultData.ib_timestamp;
        resultData.activity = `Inbound at ${latest.current_facility || 'Unknown'}`;
      }
      
      if (outboundData.data && outboundData.data.length > 0) {
        const latest = outboundData.data[0];
        resultData.current_status = resultData.current_status || 'outbound';
        resultData.destination = resultData.destination || latest.destination;
        resultData.ob_timestamp = latest.timestamp_out || resultData.ob_timestamp;
        resultData.consignment_no = latest.consignment_id || resultData.consignment_no;
        resultData.activity = `Outbound to ${latest.destination || 'Unknown'}`;
      }
      
      if (stagingData.data && stagingData.data.length > 0) {
        const latest = stagingData.data[0];
        resultData.current_status = resultData.current_status || 'staged';
        resultData.current_facility = resultData.current_facility || latest.staging_facility;
        resultData.grid_no = latest.grid_no || resultData.grid_no;
        resultData.destination = resultData.destination || latest.destination;
        resultData.activity = `Staged at grid ${latest.grid_no || 'Unknown'}`;
      }
      
      setSearchResult(resultData);
      console.log('Tote found:', resultData);

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
          activity: `Staged at grid ${entry.grid_no || 'Unknown'}`,
          timestamp: entry.grid_timestamp,
          facility: entry.staging_facility || 'Unknown',
          operator: entry.operator_name,
          status: entry.status
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      console.log('History data compiled:', history);
      setToteHistory(history);
      return resultData;
    } catch (err) {
      console.error('Error in tote search:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to search for tote');
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