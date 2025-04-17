
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageCheck, Truck } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ConsignmentPanelProps {
  consignmentId: string;
  status: string;
  totalTotes: number;
  destination: string;
  isPopup?: boolean;
}

const ConsignmentPanel: React.FC<ConsignmentPanelProps> = ({
  consignmentId,
  status,
  totalTotes,
  destination,
  isPopup = false
}) => {
  return (
    <div className={isPopup ? "fixed top-4 right-4 z-50 w-96 shadow-lg" : ""}>
      <Card className={isPopup ? "border-2 border-green-500 bg-green-50" : ""}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isPopup ? (
                <PackageCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Truck className="h-5 w-5 text-blue-600" />
              )}
              <h3 className="text-lg font-medium">
                {isPopup ? "Consignment Created" : "Consignment Details"}
              </h3>
            </div>
            <Badge variant={status === 'intransit' ? "outline" : "success"}>
              {status === 'intransit' ? 'In Transit' : status}
            </Badge>
          </div>
          
          <Alert>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <AlertTitle className="text-xs text-gray-500">Consignment ID</AlertTitle>
                <AlertDescription className="font-mono font-bold">{consignmentId}</AlertDescription>
              </div>
              <div>
                <AlertTitle className="text-xs text-gray-500">Total Totes</AlertTitle>
                <AlertDescription className="font-bold">{totalTotes}</AlertDescription>
              </div>
              <div className="col-span-2">
                <AlertTitle className="text-xs text-gray-500">Destination</AlertTitle>
                <AlertDescription className="font-medium">{destination}</AlertDescription>
              </div>
            </div>
          </Alert>
          
          {isPopup && (
            <p className="text-sm text-green-700">
              This consignment has been created and is available for inbound at {destination}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsignmentPanel;
