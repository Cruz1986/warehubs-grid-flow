
import React from 'react';
import { Card } from "@/components/ui/card";
import ToteScanner from './ToteScanner';
import ToteTable from './ToteTable';
import DestinationSelector from './outbound/DestinationSelector';
import { useOutboundProcessing } from '@/hooks/useOutboundProcessing';
import ConsignmentPanel from './outbound/ConsignmentPanel';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from 'lucide-react';

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
    showCompletedMessage,
    showConsignmentPopup,
    startScanning,
    completeOutbound,
    handleToteScan,
    setShowConsignmentPopup
  } = useOutboundProcessing(userFacility);

  // Filter out current facility from destinations
  const availableDestinations = facilities.filter(facility => facility !== userFacility);

  return (
    <div className="space-y-6 relative">
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
      
      {showCompletedMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Outbound Process Completed</AlertTitle>
          <AlertDescription>
            All totes have been successfully sent to {selectedDestination}.
            {consignmentId && <span className="block mt-1">Consignment ID: <span className="font-mono font-bold">{consignmentId}</span></span>}
          </AlertDescription>
        </Alert>
      )}
      
      {consignmentId && !showCompletedMessage && (
        <ConsignmentPanel 
          consignmentId={consignmentId}
          status={consignmentStatus}
          totalTotes={recentScans.length}
          destination={selectedDestination}
        />
      )}
      
      {/* Floating popup for consignment notification */}
      {showConsignmentPopup && consignmentId && (
        <ConsignmentPanel 
          consignmentId={consignmentId}
          status="intransit"
          totalTotes={recentScans.length}
          destination={selectedDestination}
          isPopup={true}
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
    </div>
  );
};

export default OutboundProcessingForm;
