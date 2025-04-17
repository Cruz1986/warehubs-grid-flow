
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Truck } from 'lucide-react';

interface ConsignmentStatusBadgeProps {
  status: string;
}

const ConsignmentStatusBadge: React.FC<ConsignmentStatusBadgeProps> = ({ status }) => {
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

  return (
    <div className="flex items-center">
      {getStatusIcon(status)}
      <span className="md:hidden ml-2 capitalize">{status}</span>
    </div>
  );
};

export default ConsignmentStatusBadge;
