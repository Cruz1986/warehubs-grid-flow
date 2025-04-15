
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tote } from '@/components/operations/ToteTable';

interface ActivityData {
  [key: string]: number;
}

interface GridStatus {
  id: string;
  grid_number: string;
  status: string;
}

export const useStatusData = () => {
  const [inboundTotes, setInboundTotes] = useState<Tote[]>([]);
  const [stagedTotes, setStagedTotes] = useState<Tote[]>([]);
  const [outboundTotes, setOutboundTotes] = useState<Tote[]>([]);
  
  const [facilityData, setFacilityData] = useState<ActivityData>({
    'Inbound': 0,
    'Staged': 0,
    'Outbound': 0,
    'Pending': 0,
  });
  
  const [gridStatuses, setGridStatuses] = useState<GridStatus[]>([]);
  
  const [isLoadingTotes, setIsLoadingTotes] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoadingGrids, setIsLoadingGrids] = useState(true);

  // Fetch Totes Data
  useEffect(() => {
    const fetchTotes = async () => {
      try {
        setIsLoadingTotes(true);
        
        const { data: inboundData, error: inboundError } = await supabase
          .from('tote_inbound')
          .select('*')
          .eq('status', 'inbound')
          .order('timestamp_in', { ascending: false })
          .limit(10);
        
        if (inboundError) {
          console.error('Error fetching inbound totes:', inboundError);
        } else {
          const formattedInbound = inboundData.map(tote => ({
            id: tote.tote_id,
            status: 'inbound' as const,
            source: tote.source || 'Unknown',
            destination: 'Current Facility',
            timestamp: new Date(tote.timestamp_in).toLocaleString(),
            user: tote.operator_name || 'Unknown',
            grid: undefined,
          }));
          setInboundTotes(formattedInbound);
        }
        
        const { data: stagedData, error: stagedError } = await supabase
          .from('tote_staging')
          .select('*')
          .eq('status', 'staged')
          .order('grid_timestamp', { ascending: false })
          .limit(10);
        
        if (stagedError) {
          console.error('Error fetching staged totes:', stagedError);
        } else {
          const formattedStaged = stagedData.map(tote => ({
            id: tote.tote_id || 'Unknown',
            status: 'staged' as const,
            source: 'Current Facility',
            destination: tote.destination || 'Unknown',
            timestamp: new Date(tote.grid_timestamp).toLocaleString(),
            user: tote.operator_name || 'Unknown',
            grid: tote.grid_no,
          }));
          setStagedTotes(formattedStaged);
        }
        
        const { data: outboundData, error: outboundError } = await supabase
          .from('tote_outbound')
          .select('*')
          .eq('status', 'outbound')
          .order('timestamp_out', { ascending: false })
          .limit(10);
        
        if (outboundError) {
          console.error('Error fetching outbound totes:', outboundError);
        } else {
          const formattedOutbound = outboundData.map(tote => ({
            id: tote.tote_id,
            status: 'outbound' as const,
            source: 'Current Facility',
            destination: tote.destination || 'Unknown',
            timestamp: new Date(tote.timestamp_out).toLocaleString(),
            user: tote.operator_name || 'Unknown',
            grid: undefined,
          }));
          setOutboundTotes(formattedOutbound);
        }
      } catch (error) {
        console.error('Error fetching totes data:', error);
      } finally {
        setIsLoadingTotes(false);
      }
    };
    
    fetchTotes();
    
    const inboundChannel = supabase
      .channel('tote-inbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_inbound' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    const stagingChannel = supabase
      .channel('tote-staging-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_staging' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    const outboundChannel = supabase
      .channel('tote-outbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tote_outbound' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(inboundChannel);
      supabase.removeChannel(stagingChannel);
      supabase.removeChannel(outboundChannel);
    };
  }, []);

  // Fetch Activity Data
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setIsLoadingActivity(true);
        
        const { data: inboundCount, error: inboundError } = await supabase
          .from('tote_inbound')
          .select('count')
          .eq('status', 'inbound')
          .single();
          
        const { data: outboundCount, error: outboundError } = await supabase
          .from('tote_outbound')
          .select('count')
          .eq('status', 'outbound')
          .single();
          
        const { data: stagingCount, error: stagingError } = await supabase
          .from('tote_staging')
          .select('count')
          .eq('status', 'staged')
          .single();
          
        const { data: pendingCount, error: pendingError } = await supabase
          .from('tote_inbound')
          .select('count')
          .eq('status', 'pending')
          .single();
        
        if (inboundError || outboundError || stagingError || pendingError) {
          console.error('Error fetching activity counts');
        } else {
          setFacilityData({
            'Inbound': Number(inboundCount?.count ?? 0),
            'Staged': Number(stagingCount?.count ?? 0),
            'Outbound': Number(outboundCount?.count ?? 0),
            'Pending': Number(pendingCount?.count ?? 0),
          });
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setIsLoadingActivity(false);
      }
    };
    
    fetchActivityData();
    
    const activityChannel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchActivityData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(activityChannel);
    };
  }, []);

  // Fetch Grid Data
  useEffect(() => {
    const fetchGridData = async () => {
      try {
        setIsLoadingGrids(true);
        
        const { data, error } = await supabase
          .from('grid_master')
          .select('*')
          .limit(25);
        
        if (error) {
          console.error('Error fetching grid data:', error);
        } else {
          const formattedGrids = data.map(grid => ({
            id: grid.id,
            grid_number: grid.grid_no,
            status: 'available', // Default status
            source: grid.source_name,
            destination: grid.destination_name
          }));
          setGridStatuses(formattedGrids);
        }
      } catch (error) {
        console.error('Error fetching grid data:', error);
      } finally {
        setIsLoadingGrids(false);
      }
    };
    
    fetchGridData();
    
    const gridChannel = supabase
      .channel('grid-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grid_master' }, () => {
        fetchGridData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(gridChannel);
    };
  }, []);

  return {
    inboundTotes,
    stagedTotes,
    outboundTotes,
    facilityData,
    gridStatuses,
    isLoadingTotes,
    isLoadingActivity,
    isLoadingGrids
  };
};
