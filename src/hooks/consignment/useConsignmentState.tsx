
import { useState, useEffect } from 'react';
import { Tote } from '@/components/operations/ToteTable';

export const useConsignmentState = (recentScans: Tote[]) => {
  const [consignmentId, setConsignmentId] = useState<string | null>(null);
  const [consignmentStatus, setConsignmentStatus] = useState<string>('pending');

  // Check for existing consignment if there are scans
  useEffect(() => {
    if (recentScans.length > 0 && recentScans[0].consignmentId) {
      setConsignmentId(recentScans[0].consignmentId);
      setConsignmentStatus(recentScans[0].consignmentStatus || 'pending');
    }
  }, [recentScans]);

  return {
    consignmentId,
    consignmentStatus,
    setConsignmentId,
    setConsignmentStatus
  };
};
