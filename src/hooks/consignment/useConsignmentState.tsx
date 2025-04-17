
import { useState, useEffect } from 'react';
import { Tote } from '@/components/operations/ToteTable';

export const useConsignmentState = (recentScans: Tote[]) => {
  const [consignmentId, setConsignmentId] = useState<string | null>(null);
  const [consignmentStatus, setConsignmentStatus] = useState<string>('pending');
  const [expectedToteCount, setExpectedToteCount] = useState<number>(0);
  const [receivedToteCount, setReceivedToteCount] = useState<number>(0);

  // Check for existing consignment if there are scans
  useEffect(() => {
    if (recentScans.length > 0 && recentScans[0].consignmentId) {
      setConsignmentId(recentScans[0].consignmentId);
      setConsignmentStatus(recentScans[0].consignmentStatus || 'pending');
      setReceivedToteCount(recentScans.length);
    }
  }, [recentScans]);

  return {
    consignmentId,
    consignmentStatus,
    expectedToteCount,
    receivedToteCount,
    setConsignmentId,
    setConsignmentStatus,
    setExpectedToteCount,
    setReceivedToteCount
  };
};
