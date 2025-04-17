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
  }, [currentFacility]);

  const handleReceiveConsignment = async (consignmentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update consignment status to 'received'
      const { error } = await supabase
        .from('consignment_log')
        .update({
          status: 'received',
          received_time: new Date().toISOString(),
          received_by: localStorage.getItem('username') || 'unknown',
          received_count: 0 // You might want to implement a way to track received count
        })
        .eq('consignment_id', consignmentId);

      if (error) {
        console.error('Error updating consignment status:', error);
        setError('Failed to update consignment status');
        toast.error('Failed to update consignment status');
        return;
      }

      // Refresh consignments
      const { data, error: fetchError } = await supabase
        .from('consignment_log')
        .select('*')
        .eq('destination_facility', currentFacility)
        .in('status', ['intransit', 'pending'])
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching updated consignments:', fetchError);
        setError('Failed to fetch updated consignments');
        toast.error('Failed to fetch updated consignments');
        return;
      }

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
      toast.success(`Consignment ${consignmentId} marked as received`);
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
                        <Badge variant="outline" onClick={() => handleReceiveConsignment(consignment.id)}>
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
