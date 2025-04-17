
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import ToteScanner from './ToteScanner';
import ToteTable from './ToteTable';
import DestinationSelector from './outbound/DestinationSelector';
import { useOutboundProcessing } from '@/hooks/useOutboundProcessing';
import ConsignmentPanel from './outbound/ConsignmentPanel';

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
    consignmentId,
    consignmentStatus,
    startScanning,
    completeOutbound,
    handleToteScan,
    generateConsignment
  } = useOutboundProcessing(userFacility);

  // Filter out current facility from destinations
  const availableDestinations = facilities.filter(facility => facility !== userFacility);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DestinationSelector 
          facilities={availableDestinations}
          selectedDestination={selectedDestination}
          onChange={setSelectedDestination}
          onStartScanning={startScanning}
          onCompleteOutbound={completeOutbound}
          isScanningActive={isScanningActive}
          isLoading={isLoading}
          currentFacility={userFacility}
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
      
      {consignmentId && (
        <ConsignmentPanel 
          consignmentId={consignmentId}
          status={consignmentStatus}
          totalTotes={recentScans.length}
          destination={selectedDestination}
        />
      )}
      
      <ToteTable
        totes={recentScans}
        title="Recent Outbound Scans"
        isLoading={isProcessing}
        hideGrid={false}
        hideCurrentFacility={false}
        hideSource={false}
        hideDestination={false}
        hideConsignment={false}
      />

      {recentScans.length > 0 && !consignmentId && (
        <div className="flex justify-end mt-4">
          <button
            onClick={generateConsignment}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            disabled={isProcessing}
          >
            Generate Consignment ID
          </button>
        </div>
      )}
    </div>
  );
};

export default OutboundProcessingForm;
