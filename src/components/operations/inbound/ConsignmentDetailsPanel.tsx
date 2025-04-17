
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageCheck, AlertTriangle } from 'lucide-react';

interface ConsignmentDetailsPanelProps {
  consignmentId: string;
  sourceFacility: string;
  expectedToteCount: number;
  receivedToteCount: number;
}

const ConsignmentDetailsPanel: React.FC<ConsignmentDetailsPanelProps> = ({
  consignmentId,
  sourceFacility,
  expectedToteCount,
  receivedToteCount
}) => {
  const isDiscrepancy = expectedToteCount !== receivedToteCount;
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <PackageCheck className="h-5 w-5 mr-2 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Consignment ID</h3>
              <p className="text-lg font-semibold">{consignmentId}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Source Facility</h3>
            <p className="font-medium">{sourceFacility}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Expected Totes</h3>
            <p className="font-medium">{expectedToteCount}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Received Totes</h3>
            <p className="font-medium">{receivedToteCount}</p>
          </div>
          
          <div>
            {isDiscrepancy ? (
              <Badge variant="destructive" className="flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {receivedToteCount < expectedToteCount 
                  ? `Missing ${expectedToteCount - receivedToteCount} totes` 
                  : `Excess ${receivedToteCount - expectedToteCount} totes`}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Count matches
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsignmentDetailsPanel;
