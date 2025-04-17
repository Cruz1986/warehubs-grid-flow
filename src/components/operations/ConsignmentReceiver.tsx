
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client'; 
import { Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ConsignmentReceiverProps {
  currentFacility: string;
}

const ConsignmentReceiver: React.FC<ConsignmentReceiverProps> = ({ currentFacility }) => {
  const [consignmentId, setConsignmentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastReceived, setLastReceived] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleReceiveConsignment = async () => {
    if (!consignmentId.trim()) {
      toast.error("Please enter a consignment ID");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Find the consignment
      const { data: consignmentData, error: consignmentError } = await supabase
        .from('consignment_log')
        .select('*')
        .eq('consignment_id', consignmentId)
        .maybeSingle();
        
      if (consignmentError) {
        throw consignmentError;
      }
      
      if (!consignmentData) {
        toast.error(`Consignment ${consignmentId} not found`);
        return;
      }
      
      // Verify this facility is the destination for this consignment
      if (consignmentData.destination_facility !== currentFacility) {
        const errorMsg = `This consignment is destined for ${consignmentData.destination_facility}, not ${currentFacility}`;
        
        // Log the error
        await supabase
          .from('scan_error_logs')
          .insert({
            error_message: errorMsg,
            operator: localStorage.getItem('username') || 'unknown',
            operation_type: 'consignment_receive',
            scan_data: { consignment_id: consignmentId, attempted_facility: currentFacility }
          });
          
        toast.error(errorMsg);
        return;
      }
      
      // Check if consignment is already delivered
      if (consignmentData.status === 'delivered') {
        toast.warning(`Consignment ${consignmentId} has already been received at ${currentFacility}`);
        return;
      }
      
      // Get totes in this consignment
      const { data: outboundTotes, error: outboundError } = await supabase
        .from('tote_outbound')
        .select('tote_id')
        .eq('consignment_id', consignmentId);
        
      if (outboundError) {
        throw outboundError;
      }
      
      if (!outboundTotes || outboundTotes.length === 0) {
        toast.error(`No totes found for consignment ${consignmentId}`);
        return;
      }
      
      const toteIds = outboundTotes.map(t => t.tote_id);
      const username = localStorage.getItem('username') || 'unknown';
      
      // Update tote_register for all totes to show they're now at this facility
      let errorCount = 0;
      for (const toteId of toteIds) {
        const { error: registerError } = await supabase
          .from('tote_register')
          .update({
            current_status: 'delivered',
            current_facility: currentFacility,
          })
          .eq('tote_id', toteId);
          
        if (registerError) {
          console.error(`Error updating tote_register for ${toteId}:`, registerError);
          errorCount++;
        }
      }
      
      // Update consignment status to delivered
      const { error: updateError } = await supabase
        .from('consignment_log')
        .update({
          status: 'delivered',
          received_time: new Date().toISOString(),
          received_by: username,
          received_count: toteIds.length - errorCount
        })
        .eq('consignment_id', consignmentId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update outbound totes to mark them as delivered
      const { error: outboundUpdateError } = await supabase
        .from('tote_outbound')
        .update({
          status: 'delivered',
          completed_time: new Date().toISOString(),
          completed_by: username
        })
        .eq('consignment_id', consignmentId);
        
      if (outboundUpdateError) {
        console.error('Error updating outbound totes:', outboundUpdateError);
      }
      
      setLastReceived(consignmentId);
      toast.success(`Consignment ${consignmentId} received at ${currentFacility} with ${toteIds.length} totes`);
      setConsignmentId('');
      
      // Focus back on the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err: any) {
      console.error('Error receiving consignment:', err);
      toast.error(`Failed to process consignment: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleReceiveConsignment();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="mr-2 h-5 w-5" />
          Receive Consignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Scan or enter consignment ID"
            value={consignmentId}
            onChange={(e) => setConsignmentId(e.target.value)}
            className="flex-1"
            disabled={isLoading}
            onKeyDown={handleKeyDown}
          />
          <Button 
            onClick={handleReceiveConsignment} 
            disabled={isLoading || !consignmentId.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : "Receive"}
          </Button>
        </div>
        
        {lastReceived && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            <div>
              <p className="text-sm font-medium">Last received consignment:</p>
              <p className="text-lg font-bold">{lastReceived}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsignmentReceiver;
