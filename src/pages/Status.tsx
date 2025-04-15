
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusCards from '../components/dashboard/StatusCards';
import ToteTable from '../components/operations/ToteTable';
import { Tote } from '../components/operations/ToteTable';
import { BarChart, Package, Grid2X2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityData {
  [key: string]: number;
}

interface GridStatus {
  id: string;
  grid_number: string;
  status: string;
}

const Status = () => {
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

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Status Dashboard</h1>
      
      <StatusCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart className="mr-2 h-5 w-5" />
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(facilityData).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {key === 'Inbound' && <Package className="h-4 w-4 text-blue-600" />}
                        {key === 'Staged' && <Grid2X2 className="h-4 w-4 text-yellow-600" />}
                        {key === 'Outbound' && <Package className="h-4 w-4 text-green-600" />}
                        {key === 'Pending' && <Package className="h-4 w-4 text-red-600" />}
                        <span className="text-sm font-medium">{key}</span>
                      </div>
                      <span className="text-sm font-bold">{value} totes</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          key === 'Inbound' ? 'bg-blue-600' : 
                          key === 'Staged' ? 'bg-yellow-600' : 
                          key === 'Outbound' ? 'bg-green-600' : 
                          'bg-red-600'
                        }`} 
                        style={{ width: `${Math.min(100, (value / Math.max(1, Object.values(facilityData).reduce((a, b) => a + b, 0))) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Grid2X2 className="mr-2 h-5 w-5" />
              Grid Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingGrids ? (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-md" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {gridStatuses.length > 0 ? 
                    gridStatuses.map((grid, index) => {
                      const isOccupied = grid.status === 'occupied';
                      
                      return (
                        <div 
                          key={grid.id}
                          className={`aspect-square flex items-center justify-center rounded-md text-xs font-medium border ${
                            isOccupied 
                              ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                          title={`${grid.grid_number}: ${isOccupied ? 'Occupied' : 'Available'}`}
                        >
                          {index + 1}
                        </div>
                      );
                    }) : 
                    Array.from({ length: 25 }).map((_, index) => {
                      return (
                        <div 
                          key={index}
                          className="aspect-square flex items-center justify-center rounded-md text-xs font-medium border bg-gray-50 border-gray-200 text-gray-500"
                        >
                          {index + 1}
                        </div>
                      );
                    })
                  }
                </div>
                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-sm mr-1"></div>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded-sm mr-1"></div>
                    <span>Available</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue="inbound">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbound">Inbound</TabsTrigger>
            <TabsTrigger value="staged">Staged</TabsTrigger>
            <TabsTrigger value="outbound">Outbound</TabsTrigger>
          </TabsList>
          <TabsContent value="inbound">
            <ToteTable totes={inboundTotes} title="Recent Inbound Totes" isLoading={isLoadingTotes} />
          </TabsContent>
          <TabsContent value="staged">
            <ToteTable totes={stagedTotes} title="Currently Staged Totes" isLoading={isLoadingTotes} />
          </TabsContent>
          <TabsContent value="outbound">
            <ToteTable totes={outboundTotes} title="Recent Outbound Totes" isLoading={isLoadingTotes} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Status;
