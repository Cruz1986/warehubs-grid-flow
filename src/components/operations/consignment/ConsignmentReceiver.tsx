
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConsignmentReceiver } from '@/hooks/consignment/useConsignmentReceiver';
import ConsignmentTable from './ConsignmentTable';
import DiscrepancyAlert from '../inbound/DiscrepancyAlert';

interface ConsignmentReceiverProps {
  currentFacility: string;
}

const ConsignmentReceiver: React.FC<ConsignmentReceiverProps> = ({ currentFacility }) => {
  const {
    consignments,
    isLoading,
    error,
    handleReceiveConsignment,
    currentConsignment,
    showDiscrepancy,
    handleDiscrepancyConfirm,
    handleDiscrepancyClose,
    formatDate
  } = useConsignmentReceiver(currentFacility);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Receive Consignments</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ConsignmentTable
        consignments={consignments}
        isLoading={isLoading}
        onReceive={handleReceiveConsignment}
        formatDate={formatDate}
      />

      {currentConsignment && showDiscrepancy && (
        <DiscrepancyAlert
          isOpen={showDiscrepancy}
          onClose={handleDiscrepancyClose}
          onConfirm={handleDiscrepancyConfirm}
          expectedCount={currentConsignment.toteCount}
          actualCount={currentConsignment.receivedCount || 0}
        />
      )}
    </div>
  );
};

export default ConsignmentReceiver;
