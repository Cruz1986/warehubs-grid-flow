
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FacilitySelector from '../FacilitySelector';

interface DestinationSelectorProps {
  facilities: string[];
  selectedDestination: string;
  onChange: (destination: string) => void;
  onStartScanning: () => void;
  onCompleteOutbound: () => void;
  isScanningActive: boolean;
  isLoading: boolean;
}

const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  facilities,
  selectedDestination,
  onChange,
  onStartScanning,
  onCompleteOutbound,
  isScanningActive,
  isLoading
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <FacilitySelector
          facilities={facilities}
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
            disabled={!selectedDestination || isLoading}
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
