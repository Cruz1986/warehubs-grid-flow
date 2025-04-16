
import React from 'react';
import { Card } from "@/components/ui/card";
import ToteScanner from './ToteScanner';
import ToteTable from './ToteTable';
import DestinationSelector from './outbound/DestinationSelector';
import { useOutboundProcessing } from '@/hooks/useOutboundProcessing';

interface OutboundProcessingFormProps {
  facilities: string[];
  userFacility: string;
  isLoading: boolean;
}

const OutboundProcessingForm: React.FC<OutboundProcessingFormProps> = ({
  facilities,
  userFacility,
  isLoading,
}) => {
  const {
    selectedDestination,
    setSelectedDestination,
    isProcessing,
    isScanningActive,
    recentScans,
    toteInputRef,
    startScanning,
    completeOutbound,
    handleToteScan
  } = useOutboundProcessing(userFacility);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DestinationSelector 
          facilities={facilities}
          selectedDestination={selectedDestination}
          onChange={setSelectedDestination}
          onStartScanning={startScanning}
          onCompleteOutbound={completeOutbound}
          isScanningActive={isScanningActive}
          isLoading={isLoading}
        />
        
        <div className="md:col-span-2">
          <ToteScanner 
            onScan={handleToteScan}
            inputRef={toteInputRef}
            isLoading={isProcessing}
            disabled={!isScanningActive}
            placeholder={isScanningActive ? "Scan tote for outbound" : "Start scanning process first"}
          />
        </div>
      </div>
      
      <ToteTable
        totes={recentScans}
        title="Recent Outbound Scans"
        isLoading={isProcessing}
        hideGrid={false}
        hideCurrentFacility={false}
        hideSource={false}
        hideDestination={false}
      />
    </div>
  );
};

export default OutboundProcessingForm;
