
import React, { useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConsignmentReceiver } from '@/hooks/consignment/useConsignmentReceiver';
import ConsignmentTable from './ConsignmentTable';
import DiscrepancyAlert from '../inbound/DiscrepancyAlert';
import { AlertCircle } from 'lucide-react';

interface ConsignmentReceiverProps {
  currentFacility: string;
  isAdmin?: boolean;
}

const ConsignmentReceiver: React.FC<ConsignmentReceiverProps> = ({ 
  currentFacility,
  isAdmin = false
}) => {
  const {
    consignments,
    isLoading,
    error,
    handleReceiveConsignment,
    currentConsignment,
    showDiscrepancy,
    handleDiscrepancyConfirm,
    handleDiscrepancyClose,
    formatDate,
    refetchConsignments
  } = useConsignmentReceiver(currentFacility, isAdmin);

  // Force refresh consignments on mount
  useEffect(() => {
    refetchConsignments();
  }, [refetchConsignments]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Receive Consignments</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && consignments.length === 0 && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No consignments available for {currentFacility}. Please check back later or contact your supervisor.
          </AlertDescription>
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
