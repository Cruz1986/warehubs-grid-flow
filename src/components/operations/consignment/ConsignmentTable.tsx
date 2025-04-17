
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Consignment } from '@/types/consignment';
import { Skeleton } from "@/components/ui/skeleton";
import ConsignmentTableRow from './ConsignmentTableRow';

interface ConsignmentTableProps {
  consignments: Consignment[];
  isLoading: boolean;
  onReceive: (consignmentId: string) => void;
  formatDate: (dateString: string) => string;
}

const ConsignmentTable: React.FC<ConsignmentTableProps> = ({
  consignments,
  isLoading,
  onReceive,
  formatDate
}) => {
  return (
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
                <ConsignmentTableRow 
                  key={consignment.id}
                  consignment={consignment}
                  onReceive={onReceive}
                  formatDate={formatDate}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ConsignmentTable;
