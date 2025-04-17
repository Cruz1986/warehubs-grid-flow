
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Consignment } from '@/types/consignment';
import ConsignmentStatusBadge from './ConsignmentStatusBadge';

interface ConsignmentTableRowProps {
  consignment: Consignment;
  onReceive: (consignmentId: string) => void;
  formatDate: (dateString: string) => string;
}

const ConsignmentTableRow: React.FC<ConsignmentTableRowProps> = ({ 
  consignment, 
  onReceive,
  formatDate
}) => {
  return (
    <TableRow key={consignment.id}>
      <TableCell>
        <ConsignmentStatusBadge status={consignment.status} />
      </TableCell>
      <TableCell className="font-medium">{consignment.id}</TableCell>
      <TableCell className="hidden md:table-cell">{consignment.source}</TableCell>
      <TableCell className="hidden md:table-cell">{consignment.toteCount}</TableCell>
      <TableCell className="hidden md:table-cell">{formatDate(consignment.createdAt)}</TableCell>
      <TableCell className="text-right">
        {consignment.status !== 'received' ? (
          <Badge 
            variant="outline" 
            onClick={() => onReceive(consignment.id)} 
            className="cursor-pointer hover:bg-primary/10"
          >
            Receive
          </Badge>
        ) : (
          <Badge variant="secondary">Received</Badge>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ConsignmentTableRow;
