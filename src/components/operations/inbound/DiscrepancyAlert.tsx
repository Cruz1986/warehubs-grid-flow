
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
                <div className="pt-2 bg-amber-50 p-3 rounded-md mt-2 border border-amber-200">
                  <p className="font-semibold text-amber-800">Important:</p>
                  <p className="text-amber-700">This discrepancy will be logged in the system. Please ensure you've scanned all totes before confirming.</p>
                  <p className="text-amber-700 mt-1">Do you want to proceed with receiving this consignment despite the missing totes?</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p>There are <strong className="text-orange-600">{difference} extra totes</strong> in this consignment.</p>
                <p>Expected: {expectedCount} totes</p>
                <p>Received: {actualCount} totes</p>
                <div className="pt-2 bg-amber-50 p-3 rounded-md mt-2 border border-amber-200">
                  <p className="font-semibold text-amber-800">Important:</p>
                  <p className="text-amber-700">The extra totes will be included in this consignment's receipt. This discrepancy will be logged.</p>
                  <p className="text-amber-700 mt-1">Do you want to proceed with receiving this consignment with these additional totes?</p>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={isMissing ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}>
            Confirm Receipt with {isMissing ? "Missing" : "Extra"} Totes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DiscrepancyAlert;
