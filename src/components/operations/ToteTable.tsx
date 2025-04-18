import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PackageOpen, 
  PackageCheck, 
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export interface Tote {
  id: string;
  status: 'inbound' | 'staged' | 'outbound' | 'intransit' | 'completed' | 'delivered';
  source: string;
  destination: string;
  timestamp: string;
  user: string;
  grid?: string;
  currentFacility?: string; 
  stagingTime?: string;
  completedTime?: string;
  consignmentId?: string;
  consignmentStatus?: string;
  isNewTote?: boolean;
}

interface ToteTableProps {
  totes: Tote[];
  title?: string;
  isLoading?: boolean;
  error?: string | null;
  hideDestination?: boolean;
  hideGrid?: boolean;
  hideSource?: boolean;
  hideCurrentFacility?: boolean;
  hideConsignment?: boolean;
  alwaysHideDestinationForInbound?: boolean;
}

const ToteTable: React.FC<ToteTableProps> = ({ 
  totes, 
  title, 
  isLoading = false,
  error = null,
  hideDestination = false,
  hideGrid = false,
  hideSource = false,
  hideCurrentFacility = false,
  hideConsignment = false, // Changed default to false to show consignment info
  alwaysHideDestinationForInbound = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'inbound':
        return <PackageOpen className="h-4 w-4 text-blue-600" />;
      case 'outbound':
        return <PackageCheck className="h-4 w-4 text-green-600" />;
      case 'intransit':
        return <Truck className="h-4 w-4 text-orange-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-700" />;
      case 'completed':
        return <Package className="h-4 w-4 text-green-600" />;
      default:
        return <Package className="h-4 w-4 text-yellow-600" />;
    }
  };
  
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  return (
    <div>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      
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
                <TableHead>Tote ID</TableHead>
                {!hideSource && <TableHead className="hidden md:table-cell">Source</TableHead>}
                {/* Conditionally render destination column */}
                {!(hideDestination || (alwaysHideDestinationForInbound && totes.length > 0 && totes[0].status === 'inbound')) && (
                  <TableHead className="hidden md:table-cell">Destination</TableHead>
                )}
                {!hideCurrentFacility && <TableHead className="hidden md:table-cell">Current Facility</TableHead>}
                {!hideGrid && <TableHead className="hidden md:table-cell">Grid</TableHead>}
                {!hideConsignment && <TableHead className="hidden md:table-cell">Consignment</TableHead>}
                <TableHead className="hidden md:table-cell">Time</TableHead>
                <TableHead className="hidden md:table-cell">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    {!hideSource && <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>}
                    {/* Conditionally render destination skeleton */}
                    {!(hideDestination || (alwaysHideDestinationForInbound && totes.length > 0 && totes[0].status === 'inbound')) && (
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    )}
                    {!hideCurrentFacility && <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>}
                    {!hideGrid && <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>}
                    {!hideConsignment && <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>}
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : totes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    No totes found
                  </TableCell>
                </TableRow>
              ) : (
                totes.map((tote) => (
                  <TableRow key={tote.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(tote.status)}
                        <span className="md:hidden ml-2 capitalize">{tote.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{tote.id}</TableCell>
                    {!hideSource && <TableCell className="hidden md:table-cell">{tote.source}</TableCell>}
                    {/* Conditionally render destination cell */}
                    {!(hideDestination || (alwaysHideDestinationForInbound && tote.status === 'inbound')) && (
                      <TableCell className="hidden md:table-cell">{tote.destination}</TableCell>
                    )}
                    {!hideCurrentFacility && <TableCell className="hidden md:table-cell">{tote.currentFacility || '-'}</TableCell>}
                    {!hideGrid && <TableCell className="hidden md:table-cell">{tote.grid || '-'}</TableCell>}
                    {!hideConsignment && (
                      <TableCell className="hidden md:table-cell">
                        {tote.consignmentId ? (
                          <div>
                            <div className="font-medium text-sm">{tote.consignmentId}</div>
                            {tote.consignmentStatus && (
                              <Badge variant={
                                tote.consignmentStatus === 'In Transit' ? 'outline' :
                                tote.consignmentStatus === 'Delivered' ? 'success' : 'secondary'
                              } className="mt-1">
                                {tote.consignmentStatus}
                              </Badge>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    <TableCell className="hidden md:table-cell">
                      {formatDateTime(tote.timestamp)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{tote.user}</TableCell>
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

export default ToteTable;