
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
      // Fetch current tote data
      const { data: currentData, error: currentError } = await supabase
        .from('tote_register')
        .select('*')
        .eq('tote_id', toteId)
        .maybeSingle();
        
      if (currentError) {
        console.error('Error searching tote:', currentError);
        setError('Failed to search for tote');
        toast.error('Failed to search for tote');
        return null;
      }

      if (!currentData) {
        setNotFound(true);
        console.log('Tote not found:', toteId);
        return null;
      }

      setSearchResult(currentData);
      console.log('Tote found:', currentData);

      // Fetch tote history from all relevant tables
      const [inbound, outbound, staging] = await Promise.all([
        supabase
          .from('tote_inbound')
          .select('*')
          .eq('tote_id', toteId)
          .order('timestamp_in', { ascending: false }),
        supabase
          .from('tote_outbound')
          .select('*')
          .eq('tote_id', toteId)
          .order('timestamp_out', { ascending: false }),
        supabase
          .from('tote_staging')
          .select('*')
          .eq('tote_id', toteId)
          .order('grid_timestamp', { ascending: false })
      ]);

      console.log('History data:', { inbound: inbound.data, outbound: outbound.data, staging: staging.data });

      // Combine and sort history
      const history: ToteHistory[] = [
        ...(inbound.data?.map(entry => ({
          activity: 'Inbound',
          timestamp: entry.timestamp_in,
          facility: entry.current_facility || 'Unknown',
          operator: entry.operator_name,
          status: entry.status
        })) || []),
        ...(outbound.data?.map(entry => ({
          activity: 'Outbound',
          timestamp: entry.timestamp_out,
          facility: entry.destination,
          operator: entry.operator_name,
          status: entry.status
        })) || []),
        ...(staging.data?.map(entry => ({
          activity: `Staged at grid ${entry.grid_no}`,
          timestamp: entry.grid_timestamp,
          facility: entry.staging_facility || 'Unknown',
          operator: entry.operator_name,
          status: entry.status
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setToteHistory(history);
      return currentData;
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
