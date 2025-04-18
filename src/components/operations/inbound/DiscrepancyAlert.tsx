
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';

interface DiscrepancyAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expectedCount: number;
  actualCount: number;
}

const DiscrepancyAlert: React.FC<DiscrepancyAlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  expectedCount,
  actualCount
}) => {
  const difference = Math.abs(expectedCount - actualCount);
  const isMissing = actualCount < expectedCount;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-amber-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Tote Count Discrepancy
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isMissing ? (
              <div className="space-y-2">
                <p>There are <strong className="text-red-600">{difference} missing totes</strong> in this consignment.</p>
                <p>Expected: {expectedCount} totes</p>
                <p>Received: {actualCount} totes</p>
                <p className="pt-2">Do you want to proceed with inbound processing despite the missing totes?</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>There are <strong className="text-orange-600">{difference} extra totes</strong> in this consignment.</p>
                <p>Expected: {expectedCount} totes</p>
                <p>Received: {actualCount} totes</p>
                <p className="pt-2">Do you want to proceed with inbound processing with these additional totes?</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm Inbound
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DiscrepancyAlert;
