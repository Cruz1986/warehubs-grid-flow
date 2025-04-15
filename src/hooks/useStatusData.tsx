
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
          .from('totes')
          .select('*, users(username)')
          .eq('status', 'inbound')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (inboundError) {
          console.error('Error fetching inbound totes:', inboundError);
        } else {
          const formattedInbound = inboundData.map(tote => ({
            id: tote.tote_number,
            status: 'inbound' as const,
            source: tote.facility_id || 'Unknown',
            destination: 'Current Facility',
            timestamp: new Date(tote.created_at).toLocaleString(),
            user: tote.users?.username || 'Unknown',
            grid: undefined,
          }));
          setInboundTotes(formattedInbound);
        }
        
        const { data: stagedData, error: stagedError } = await supabase
          .from('grids')
          .select('*, totes(*, users(username))')
          .eq('status', 'occupied')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (stagedError) {
          console.error('Error fetching staged totes:', stagedError);
        } else {
          const formattedStaged = stagedData.filter(grid => grid.totes).map(grid => ({
            id: grid.totes?.tote_number || 'Unknown',
            status: 'staged' as const,
            source: grid.totes?.facility_id || 'Unknown',
            destination: grid.destination || 'Unknown',
            timestamp: new Date(grid.created_at).toLocaleString(),
            user: grid.totes?.users?.username || 'Unknown',
            grid: grid.grid_number,
          }));
          setStagedTotes(formattedStaged);
        }
        
        const { data: outboundData, error: outboundError } = await supabase
          .from('totes')
          .select('*, users(username)')
          .eq('status', 'outbound')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (outboundError) {
          console.error('Error fetching outbound totes:', outboundError);
        } else {
          const formattedOutbound = outboundData.map(tote => ({
            id: tote.tote_number,
            status: 'outbound' as const,
            source: 'Current Facility',
            destination: tote.facility_id || 'Unknown',
            timestamp: new Date(tote.created_at).toLocaleString(),
            user: tote.users?.username || 'Unknown',
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
    
    const channel = supabase
      .channel('totes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'totes' }, () => {
        fetchTotes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grids' }, () => {
        fetchTotes();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch Activity Data
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setIsLoadingActivity(true);
        
        const { data: inboundCount, error: inboundError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'inbound')
          .single();
          
        const { data: outboundCount, error: outboundError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'outbound')
          .single();
          
        const { data: gridCount, error: gridError } = await supabase
          .from('grids')
          .select('count')
          .eq('status', 'occupied')
          .single();
          
        const { data: pendingCount, error: pendingError } = await supabase
          .from('totes')
          .select('count')
          .eq('status', 'pending')
          .single();
        
        if (inboundError || outboundError || gridError || pendingError) {
          console.error('Error fetching activity counts');
        } else {
          setFacilityData({
            'Inbound': Number(inboundCount?.count ?? 0),
            'Staged': Number(gridCount?.count ?? 0),
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
    
    const channel = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchActivityData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch Grid Data
  useEffect(() => {
    const fetchGridData = async () => {
      try {
        setIsLoadingGrids(true);
        
        const { data, error } = await supabase
          .from('grids')
          .select('*')
          .limit(25);
        
        if (error) {
          console.error('Error fetching grid data:', error);
        } else {
          setGridStatuses(data || []);
        }
      } catch (error) {
        console.error('Error fetching grid data:', error);
      } finally {
        setIsLoadingGrids(false);
      }
    };
    
    fetchGridData();
    
    const channel = supabase
      .channel('grid-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grids' }, () => {
        fetchGridData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
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
