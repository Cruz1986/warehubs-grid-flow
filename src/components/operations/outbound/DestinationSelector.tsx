
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FacilitySelector from '../FacilitySelector';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface DestinationSelectorProps {
  facilities: string[];
  selectedDestination: string;
  onChange: (destination: string) => void;
  onStartScanning: () => void;
  onCompleteOutbound: () => void;
  isScanningActive: boolean;
  isLoading: boolean;
  currentFacility: string;
}

const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  facilities,
  selectedDestination,
  onChange,
  onStartScanning,
  onCompleteOutbound,
  isScanningActive,
  isLoading,
  currentFacility
}) => {
  // Ensure current facility is not a destination option
  const availableDestinations = facilities.filter(facility => facility !== currentFacility);
  
  // Check if there's an issue with the selected destination
  const isCurrentFacility = selectedDestination === currentFacility;
  
  return (
    <Card>
      <CardContent className="pt-6">
        {isCurrentFacility && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Current facility cannot be selected as destination
            </AlertDescription>
          </Alert>
        )}
        
        <FacilitySelector
          facilities={availableDestinations}
          selectedFacility={selectedDestination}
          onChange={onChange}
          label="Destination Facility"
          isLoading={isLoading}
          disabled={isScanningActive}
        />
        
        {!isScanningActive ? (
          <Button 
            className="w-full mt-4" 
            onClick={onStartScanning} 
            disabled={!selectedDestination || isLoading || isCurrentFacility}
          >
            Start Scanning
          </Button>
        ) : (
          <Button 
            className="w-full mt-4" 
            variant="destructive" 
            onClick={onCompleteOutbound}
          >
            Complete Outbound
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DestinationSelector;
