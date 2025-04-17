
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConsignmentReceiver } from '@/hooks/consignment/useConsignmentReceiver';
import ConsignmentTable from './ConsignmentTable';

interface ConsignmentReceiverProps {
  currentFacility: string;
}

const ConsignmentReceiver: React.FC<ConsignmentReceiverProps> = ({ currentFacility }) => {
  const {
    consignments,
    isLoading,
    error,
    handleReceiveConsignment,
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
    </div>
  );
};

export default ConsignmentReceiver;
