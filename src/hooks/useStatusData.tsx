
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
          .from('Tote_Inbound')
          .select('*, users(Username)')
          .eq('Status', 'inbound')
          .order('Timestamp_In', { ascending: false })
          .limit(10);
        
        if (inboundError) {
          console.error('Error fetching inbound totes:', inboundError);
        } else {
          const formattedInbound = inboundData.map(tote => ({
            id: tote.Tote_ID,
            status: 'inbound' as const,
            source: tote.Source || 'Unknown',
            destination: 'Current Facility',
            timestamp: new Date(tote.Timestamp_In).toLocaleString(),
            user: tote.Operator_Name || 'Unknown',
            grid: undefined,
          }));
          setInboundTotes(formattedInbound);
        }
        
        const { data: stagedData, error: stagedError } = await supabase
          .from('Tote_Staging')
          .select('*')
          .eq('Status', 'staged')
          .order('GRID_Timestamp', { ascending: false })
          .limit(10);
        
        if (stagedError) {
          console.error('Error fetching staged totes:', stagedError);
        } else {
          const formattedStaged = stagedData.map(tote => ({
            id: tote.Tote_ID || 'Unknown',
            status: 'staged' as const,
            source: 'Current Facility',
            destination: tote.Destination || 'Unknown',
            timestamp: new Date(tote.GRID_Timestamp).toLocaleString(),
            user: tote.Operator_Name || 'Unknown',
            grid: tote.GRID_No,
          }));
          setStagedTotes(formattedStaged);
        }
        
        const { data: outboundData, error: outboundError } = await supabase
          .from('Tote_Outbound')
          .select('*')
          .eq('Status', 'outbound')
          .order('Timestamp_Out', { ascending: false })
          .limit(10);
        
        if (outboundError) {
          console.error('Error fetching outbound totes:', outboundError);
        } else {
          const formattedOutbound = outboundData.map(tote => ({
            id: tote.Tote_ID,
            status: 'outbound' as const,
            source: 'Current Facility',
            destination: tote.Destination || 'Unknown',
            timestamp: new Date(tote.Timestamp_Out).toLocaleString(),
            user: tote.Operator_Name || 'Unknown',
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Tote_Inbound' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    const stagingChannel = supabase
      .channel('tote-staging-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Tote_Staging' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    const outboundChannel = supabase
      .channel('tote-outbound-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Tote_Outbound' }, () => {
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
          .from('Tote_Inbound')
          .select('count')
          .eq('Status', 'inbound')
          .single();
          
        const { data: outboundCount, error: outboundError } = await supabase
          .from('Tote_Outbound')
          .select('count')
          .eq('Status', 'outbound')
          .single();
          
        const { data: stagingCount, error: stagingError } = await supabase
          .from('Tote_Staging')
          .select('count')
          .eq('Status', 'staged')
          .single();
          
        const { data: pendingCount, error: pendingError } = await supabase
          .from('Tote_Inbound')
          .select('count')
          .eq('Status', 'pending')
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
          .from('Grid_Master')
          .select('*')
          .limit(25);
        
        if (error) {
          console.error('Error fetching grid data:', error);
        } else {
          const formattedGrids = data.map(grid => ({
            id: grid.ID,
            grid_number: grid.GRID_No,
            status: 'available', // Default status
            source: grid.Source_Name,
            destination: grid.Destination_Name
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Grid_Master' }, () => {
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
