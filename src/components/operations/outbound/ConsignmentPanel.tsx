
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Truck, AlertCircle } from 'lucide-react';

interface ConsignmentPanelProps {
  consignmentId: string;
  status: string;
  totalTotes: number;
  destination: string;
}

const ConsignmentPanel: React.FC<ConsignmentPanelProps> = ({
  consignmentId,
  status,
  totalTotes,
  destination
}) => {
  let icon;
  let statusColor;
  
  switch(status) {
    case 'completed':
    case 'Completed':
      icon = <CheckCircle className="h-6 w-6 text-green-600" />;
      statusColor = "bg-green-100 text-green-800";
      break;
    case 'intransit':
    case 'In Transit':
      icon = <Truck className="h-6 w-6 text-orange-600" />;
      statusColor = "bg-orange-100 text-orange-800";
      break;
    default:
      icon = <AlertCircle className="h-6 w-6 text-blue-600" />;
      statusColor = "bg-blue-100 text-blue-800";
  }
  
  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="bg-green-50 pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            {icon}
            <span className="ml-2">Consignment</span>
          </div>
          <Badge variant="outline" className={statusColor + " ml-2 font-medium"}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Consignment ID</p>
            <p className="text-lg font-bold">{consignmentId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Totes</p>
            <p className="text-lg font-bold">{totalTotes}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Destination</p>
            <p className="text-lg font-bold">{destination}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsignmentPanel;
