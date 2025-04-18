
import { useState, useCallback } from 'react';
import { useFetchConsignments } from './useFetchConsignments';
import { Consignment } from '@/types/consignment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useConsignmentReceiver = (currentFacility: string, isAdmin: boolean = false) => {
  // Use the existing hook to fetch consignments
  const {
    consignments,
    isLoading,
    error,
    refetchConsignments
  } = useFetchConsignments(currentFacility, isAdmin);

  const [currentConsignment, setCurrentConsignment] = useState<Consignment | null>(null);
  const [showDiscrepancy, setShowDiscrepancy] = useState(false);

  // Format date utility function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle receiving a consignment
  const handleReceiveConsignment = useCallback(async (consignmentId: string) => {
    console.log(`Receiving consignment ${consignmentId}`);
    
    try {
      // Find the consignment in our local state
      const consignment = consignments.find(c => c.id === consignmentId);
      
      if (!consignment) {
        toast.error(`Consignment ${consignmentId} not found`);
        return;
      }
      
      setCurrentConsignment(consignment);
      
      // For this simple implementation, assume all totes are received
      // In a real system, you would scan each tote and count them
      const receivedCount = consignment.toteCount;
      
      // Check for discrepancy between expected and actual tote count
      if (receivedCount !== consignment.toteCount) {
        setShowDiscrepancy(true);
        return;
      }
      
      // If no discrepancy, proceed with receiving
      await completeConsignmentReceiving(consignmentId, receivedCount);
      
    } catch (err) {
      console.error('Error receiving consignment:', err);
      toast.error('Failed to receive consignment');
    }
  }, [consignments]);

  // Complete the consignment receiving process
  const completeConsignmentReceiving = async (consignmentId: string, receivedCount: number) => {
    try {
      const timestamp = new Date().toISOString();
      
      const { error } = await supabase
        .from('consignment_log')
        .update({
          status: 'received',
          received_count: receivedCount,
          received_time: timestamp,
          received_by: localStorage.getItem('username') || 'unknown'
        })
        .eq('consignment_id', consignmentId);
      
      if (error) {
        throw error;
      }
      
      toast.success(`Consignment ${consignmentId} received successfully`);
      setCurrentConsignment(null);
      refetchConsignments();
      
    } catch (err) {
      console.error('Error completing consignment receive:', err);
      toast.error('Failed to complete consignment receipt');
    }
  };

  // Handle discrepancy confirmation 
  const handleDiscrepancyConfirm = useCallback(() => {
    if (!currentConsignment) {
      setShowDiscrepancy(false);
      return;
    }
    
    // Even with discrepancy, proceed with receiving
    completeConsignmentReceiving(currentConsignment.id, currentConsignment.receivedCount || 0);
    setShowDiscrepancy(false);
  }, [currentConsignment]);

  // Handle discrepancy close/cancel
  const handleDiscrepancyClose = useCallback(() => {
    setShowDiscrepancy(false);
    setCurrentConsignment(null);
  }, []);

  return {
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
  };
};
