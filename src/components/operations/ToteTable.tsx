
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PackageOpen, 
  PackageCheck, 
  Package 
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export interface Tote {
  id: string;
  status: 'inbound' | 'staged' | 'outbound';
  source: string;
  destination: string;
  timestamp: string;
  user: string;
  grid?: string;
  currentFacility?: string; // New field
}

interface ToteTableProps {
  totes: Tote[];
  title?: string;
  isLoading?: boolean;
  hideDestination?: boolean;
  hideGrid?: boolean;
  hideSource?: boolean;
  hideCurrentFacility?: boolean;
}

const ToteTable: React.FC<ToteTableProps> = ({ 
  totes, 
  title, 
  isLoading = false,
  hideDestination = false,
  hideGrid = false,
  hideSource = false,
  hideCurrentFacility = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'inbound':
        return <PackageOpen className="h-4 w-4 text-blue-600" />;
      case 'outbound':
        return <PackageCheck className="h-4 w-4 text-green-600" />;
      default:
        return <Package className="h-4 w-4 text-yellow-600" />;
    }
  };
  
  return (
    <div>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Tote ID</TableHead>
                {!hideSource && <TableHead className="hidden md:table-cell">Source</TableHead>}
                {!hideDestination && <TableHead className="hidden md:table-cell">Destination</TableHead>}
                {!hideCurrentFacility && <TableHead className="hidden md:table-cell">Current Facility</TableHead>}
                {!hideGrid && <TableHead className="hidden md:table-cell">Grid</TableHead>}
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
                    {!hideDestination && <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>}
                    {!hideCurrentFacility && <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>}
                    {!hideGrid && <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>}
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : totes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
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
                    {!hideDestination && <TableCell className="hidden md:table-cell">{tote.destination}</TableCell>}
                    {!hideCurrentFacility && <TableCell className="hidden md:table-cell">{tote.currentFacility || '-'}</TableCell>}
                    {!hideGrid && <TableCell className="hidden md:table-cell">{tote.grid || '-'}</TableCell>}
                    <TableCell className="hidden md:table-cell">
                      {new Date(tote.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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
