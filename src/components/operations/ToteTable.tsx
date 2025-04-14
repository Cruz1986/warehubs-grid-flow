
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PackageOpen, // inbound
  PackageCheck, // outbound
  Package // staged or other
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export interface Tote {
  id: string;
  status: 'inbound' | 'staged' | 'outbound';
  source: string;
  destination: string;
  timestamp: string;
  user: string;
  grid?: string;
}

interface ToteTableProps {
  totes: Tote[];
  title?: string;
  isLoading?: boolean;
}

const ToteTable: React.FC<ToteTableProps> = ({ totes, title, isLoading = false }) => {
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inbound':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'outbound':
        return "bg-green-100 text-green-800 border-green-200";
      case 'staged':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
                <TableHead className="hidden md:table-cell">Source</TableHead>
                <TableHead className="hidden md:table-cell">Destination</TableHead>
                <TableHead className="hidden md:table-cell">Grid</TableHead>
                <TableHead className="hidden md:table-cell">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : totes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
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
                    <TableCell className="font-medium">
                      {tote.id}
                      <div className="md:hidden mt-1 text-xs text-gray-500">
                        <div>{tote.source} → {tote.destination}</div>
                        {tote.grid && <div>Grid: {tote.grid}</div>}
                        <div>{new Date(tote.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{tote.source}</TableCell>
                    <TableCell className="hidden md:table-cell">{tote.destination}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {tote.grid || '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(tote.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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

export default ToteTable;
