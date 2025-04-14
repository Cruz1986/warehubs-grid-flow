
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface Tote {
  id: string;
  status: 'inbound' | 'staged' | 'outbound';
  source: string;
  destination?: string;
  grid?: string;
  timestamp: string;
  user: string;
}

interface ToteTableProps {
  totes: Tote[];
  title: string;
}

const ToteTable = ({ totes, title }: ToteTableProps) => {
  const getStatusBadge = (status: Tote['status']) => {
    switch (status) {
      case 'inbound':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Inbound</Badge>;
      case 'staged':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Staged</Badge>;
      case 'outbound':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Outbound</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tote ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Grid</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {totes.length > 0 ? (
              totes.map((tote) => (
                <TableRow key={tote.id}>
                  <TableCell className="font-medium">{tote.id}</TableCell>
                  <TableCell>{getStatusBadge(tote.status)}</TableCell>
                  <TableCell>{tote.source}</TableCell>
                  <TableCell>{tote.destination || 'N/A'}</TableCell>
                  <TableCell>{tote.grid || 'N/A'}</TableCell>
                  <TableCell>{tote.timestamp}</TableCell>
                  <TableCell>{tote.user}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No totes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ToteTable;
