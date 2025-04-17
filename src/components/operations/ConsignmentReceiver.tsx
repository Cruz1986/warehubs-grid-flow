
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Truck } from 'lucide-react';
import { ConsignmentLog } from '@/types/consignment';

interface Consignment {
  id: string;
  source: string;
  destination: string;
  status: string;
  toteCount: number;
  createdAt: string;
  receivedCount?: number;
  receivedTime?: string;
  notes?: string;
}

interface ConsignmentReceiverProps {
  currentFacility: string;
}

const ConsignmentReceiver: React.FC<ConsignmentReceiverProps> = ({ currentFacility }) => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsignments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Modified query to get consignments for the current facility that are in transit or pending
        const { data, error } = await supabase
          .from('consignment_log')
          .select('*')
          .eq('destination_facility', currentFacility)
          .in('status', ['intransit', 'pending'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching consignments:', error);
          setError('Failed to fetch consignments');
          toast.error('Failed to fetch consignments');
          return;
        }

        console.log('Fetched consignments for facility:', currentFacility, data);
        const consignmentData = data as ConsignmentLog[] || [];

        const formattedConsignments: Consignment[] = consignmentData.map(consignment => ({
          id: consignment.consignment_id,
          source: consignment.source_facility,
          destination: consignment.destination_facility,
          status: consignment.status,
          toteCount: consignment.tote_count,
          createdAt: consignment.created_at || 'Unknown',
          receivedCount: consignment.received_count,
          receivedTime: consignment.received_time,
          notes: consignment.notes,
        }));

        setConsignments(formattedConsignments);
      } catch (err) {
        console.error('Error processing consignments:', err);
        setError('Failed to process consignments');
        toast.error('Failed to process consignments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsignments();
    
    // Set up real-time subscription for consignment updates
    const channel = supabase
      .channel('consignment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consignment_log' }, payload => {
        console.log('Consignment data changed:', payload);
        fetchConsignments();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentFacility]);

  const handleReceiveConsignment = async (consignmentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get totes for this consignment
      const { data: toteData, error: toteError } = await supabase
        .from('tote_outbound')
        .select('tote_id')
        .eq('consignment_id', consignmentId);
        
      if (toteError) {
        console.error('Error fetching totes for consignment:', toteError);
        setError('Failed to fetch totes for consignment');
        toast.error('Failed to fetch totes for consignment');
        return;
      }
      
      const toteIds = toteData.map(tote => tote.tote_id);
      console.log(`Processing ${toteIds.length} totes for consignment ${consignmentId}`);
      
      const username = localStorage.getItem('username') || 'unknown';
      const timestamp = new Date().toISOString();
      
      // Process tote inbound for each tote in the consignment
      for (const toteId of toteIds) {
        // Get consignment data for source facility
        const { data: consignmentData } = await supabase
          .from('consignment_log')
          .select('source_facility')
          .eq('consignment_id', consignmentId)
          .single();
          
        const sourceFacility = consignmentData?.source_facility || 'Unknown';
          
        // Check if tote already exists in inbound at this facility
        const { data: existingInbound } = await supabase
          .from('tote_inbound')
          .select('*')
          .eq('tote_id', toteId)
          .eq('current_facility', currentFacility)
          .eq('status', 'inbound')
          .maybeSingle();
        
        // Only insert if this is a new inbound for this facility
        if (!existingInbound) {
          // Insert tote into inbound at the destination
          const { error: inboundError } = await supabase
            .from('tote_inbound')
            .insert({
              tote_id: toteId,
              source: sourceFacility,
              current_facility: currentFacility,
              operator_name: username,
              timestamp_in: timestamp
            });
            
          if (inboundError) {
            console.error(`Error creating inbound record for tote ${toteId}:`, inboundError);
          }
        } else {
          console.log(`Tote ${toteId} already exists in inbound at ${currentFacility}, skipping insert`);
        }
        
        // Update tote_register to reflect the new location and status
        // First check if the tote exists in the register
        const { data: registerData } = await supabase
          .from('tote_register')
          .select('*')
          .eq('tote_id', toteId)
          .maybeSingle();
          
        if (registerData) {
          // Update existing record only if the current_facility is different or status needs updating
          if (registerData.current_facility !== currentFacility || registerData.current_status !== 'inbound') {
            const { error: updateError } = await supabase
              .from('tote_register')
              .update({
                current_status: 'inbound',
                current_facility: currentFacility,
                inbound_timestamp: timestamp,
                inbound_operator: username
              })
              .eq('tote_id', toteId);
              
            if (updateError) {
              console.error(`Error updating tote_register for ${toteId}:`, updateError);
            }
          }
        } else {
          // Create new register record if it doesn't exist
          const { error: createError } = await supabase
            .from('tote_register')
            .insert({
              tote_id: toteId,
              current_status: 'inbound',
              current_facility: currentFacility,
              source_facility: sourceFacility,
              inbound_timestamp: timestamp,
              inbound_operator: username
            });
            
          if (createError) {
            console.error(`Error creating tote_register for ${toteId}:`, createError);
          }
        }
      }
      
      // Update consignment status to 'received'
      const { error } = await supabase
        .from('consignment_log')
        .update({
          status: 'received',
          received_time: timestamp,
          received_by: username,
          received_count: toteIds.length
        })
        .eq('consignment_id', consignmentId);

      if (error) {
        console.error('Error updating consignment status:', error);
        setError('Failed to update consignment status');
        toast.error('Failed to update consignment status');
        return;
      }

      toast.success(`Consignment ${consignmentId} with ${toteIds.length} totes has been received`);
      
      // Remove the received consignment from the list
      setConsignments(prevConsignments => 
        prevConsignments.filter(consignment => consignment.id !== consignmentId)
      );
    } catch (err) {
      console.error('Error receiving consignment:', err);
      setError('Failed to receive consignment');
      toast.error('Failed to receive consignment');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'intransit':
        return <Truck className="h-4 w-4 text-orange-600" />;
      case 'received':
        return <CheckCircle className="h-4 w-4 text-green-700" />;
      case 'pending':
        return <Package className="h-4 w-4 text-yellow-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Receive Consignments</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Consignment ID</TableHead>
                <TableHead className="hidden md:table-cell">Source</TableHead>
                <TableHead className="hidden md:table-cell">Tote Count</TableHead>
                <TableHead className="hidden md:table-cell">Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : consignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No consignments to receive
                  </TableCell>
                </TableRow>
              ) : (
                consignments.map((consignment) => (
                  <TableRow key={consignment.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(consignment.status)}
                        <span className="md:hidden ml-2 capitalize">{consignment.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{consignment.id}</TableCell>
                    <TableCell className="hidden md:table-cell">{consignment.source}</TableCell>
                    <TableCell className="hidden md:table-cell">{consignment.toteCount}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(consignment.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {consignment.status !== 'received' ? (
                        <Badge variant="outline" onClick={() => handleReceiveConsignment(consignment.id)} className="cursor-pointer hover:bg-primary/10">
                          Receive
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Received</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ConsignmentReceiver;
