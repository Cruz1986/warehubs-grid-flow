import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import ToteScanner from './ToteScanner';
import FacilitySelector from './FacilitySelector';
import { supabase } from '@/integrations/supabase/client';
import ToteTable from './ToteTable';
import { Tote } from './ToteTable';
import ConsignmentSelector from './inbound/ConsignmentSelector';
import ConsignmentDetailsPanel from './inbound/ConsignmentDetailsPanel';
import DiscrepancyAlert from './inbound/DiscrepancyAlert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToteRegister } from '@/hooks/useToteRegister';

interface InboundProcessingFormProps {
  facilities: string[];
  userFacility: string;
  isLoading: boolean;
}

const InboundProcessingForm: React.FC<InboundProcessingFormProps> = ({
  facilities,
  userFacility,
  isLoading,
}) => {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [recentScans, setRecentScans] = useState<Tote[]>([]);
  const toteInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('direct');
  const [selectedConsignmentId, setSelectedConsignmentId] = useState<string | null>(null);
  const [consignmentSource, setConsignmentSource] = useState<string>('');
  const [expectedToteCount, setExpectedToteCount] = useState<number>(0);
  const [showDiscrepancyAlert, setShowDiscrepancyAlert] = useState(false);
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const username = user?.username || 'unknown';
  
  const { getToteRegisterInfo, createToteRegister, updateToteRegister, trackToteFacilityTransfer } = useToteRegister();
  
  useEffect(() => {
    if (isScanningActive && toteInputRef.current) {
      toteInputRef.current.focus();
    }
  }, [isScanningActive]);

  const startDirectInbound = () => {
    if (!selectedFacility) {
      toast.error("Please select a source facility before starting");
      return;
    }
    
    setIsScanningActive(true);
    toast.success(`Started scanning from ${selectedFacility}`);
    
    setTimeout(() => {
      if (toteInputRef.current) {
        toteInputRef.current.focus();
      }
    }, 100);
  };

  const handleConsignmentSelection = async (consignmentId: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('consignment_log')
        .select('*')
        .eq('consignment_id', consignmentId)
        .single();
        
      if (error) {
        console.error('Error fetching consignment:', error);
        toast.error('Failed to load consignment details');
        return;
      }
      
      setSelectedConsignmentId(consignmentId);
      setConsignmentSource(data.source_facility);
      setExpectedToteCount(data.tote_count);
      setIsScanningActive(true);
      setSelectedFacility(data.source_facility);
      
      toast.success(`Started receiving consignment ${consignmentId} from ${data.source_facility}`);
      
      setTimeout(() => {
        if (toteInputRef.current) {
          toteInputRef.current.focus();
        }
      }, 100);
    } catch (err) {
      console.error('Error processing consignment selection:', err);
      toast.error('Failed to process consignment');
    } finally {
      setIsProcessing(false);
    }
  };

  const completeInbound = async () => {
    if (recentScans.length === 0) {
      toast.warning("No totes have been scanned yet");
      return;
    }
    
    if (selectedConsignmentId && expectedToteCount > 0 && recentScans.length !== expectedToteCount) {
      setShowDiscrepancyAlert(true);
      return;
    }
    
    await finalizeInbound();
  };
  
  const finalizeInbound = async () => {
    setIsProcessing(true);
    
    try {
      if (selectedConsignmentId) {
        const { error: consignmentError } = await supabase
          .from('consignment_log')
          .update({
            status: 'received',
            received_time: new Date().toISOString(),
            received_by: username,
            received_count: recentScans.length,
            notes: recentScans.length !== expectedToteCount ? 
              `Discrepancy: Expected ${expectedToteCount}, received ${recentScans.length}` : undefined
          })
          .eq('consignment_id', selectedConsignmentId);
          
        if (consignmentError) {
          console.error('Error updating consignment:', consignmentError);
        }
      }
      
      toast.success(`Completed inbound process from ${selectedFacility}`);
      
      setRecentScans([]);
      setSelectedFacility('');
      setIsScanningActive(false);
      setSelectedConsignmentId(null);
      setConsignmentSource('');
      setExpectedToteCount(0);
      
    } catch (err) {
      console.error('Error finalizing inbound:', err);
      toast.error('Failed to complete inbound process');
    } finally {
      setIsProcessing(false);
      setShowDiscrepancyAlert(false);
    }
  };

  const handleToteScan = async (toteId: string) => {
    if (!isScanningActive) {
      toast.error("Please start the scanning process first");
      return;
    }
    
    if (recentScans.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been scanned`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const registerData = await getToteRegisterInfo(toteId);
      
      if (registerData && 
          registerData.current_facility !== userFacility && 
          registerData.current_status === 'inbound') {
        console.log(`Tote ${toteId} exists in another facility, but allowing based on current facility rule`);
      }
      
      const insertData = {
        tote_id: toteId,
        status: 'inbound',
        source: selectedFacility,
        current_facility: userFacility,
        operator_name: username
      };
      
      const { error } = await supabase
        .from('tote_inbound')
        .insert(insertData);
        
      if (error) {
        console.error('Error saving tote:', error);
        toast.error(`Failed to save tote: ${error.message}`);
        return;
      }
      
      await trackToteFacilityTransfer(
        toteId,
        selectedFacility, 
        userFacility,
        username,
        'inbound'
      );
      
      if (selectedConsignmentId) {
        const { data: outboundData } = await supabase
          .from('tote_outbound')
          .select('*')
          .eq('tote_id', toteId)
          .eq('consignment_id', selectedConsignmentId)
          .maybeSingle();
      }
      
      const newTote: Tote = {
        id: toteId,
        status: 'inbound',
        source: selectedFacility,
        destination: userFacility,
        timestamp: new Date().toISOString(),
        user: username,
        currentFacility: userFacility,
        consignmentId: selectedConsignmentId || undefined
      };
      
      setRecentScans([newTote, ...recentScans]);
      toast.success(`Tote ${toteId} has been received from ${selectedFacility}`);
      
      if (toteInputRef.current) {
        toteInputRef.current.focus();
      }
    } catch (err: any) {
      console.error('Exception saving tote:', err);
      toast.error('An unexpected error occurred while saving the tote');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="direct">Direct Inbound</TabsTrigger>
          <TabsTrigger value="consignment">Consignment Inbound</TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <FacilitySelector
                  facilities={facilities}
                  selectedFacility={selectedFacility}
                  onChange={setSelectedFacility}
                  label="Source Facility"
                  isLoading={isLoading}
                  disabled={isScanningActive}
                />
                
                {!isScanningActive ? (
                  <Button 
                    className="w-full mt-4" 
                    onClick={startDirectInbound} 
                    disabled={!selectedFacility || isLoading}
                  >
                    Start Scanning
                  </Button>
                ) : (
                  <Button 
                    className="w-full mt-4" 
                    variant="destructive" 
                    onClick={completeInbound}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Inbound"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <div className="md:col-span-2">
              <ToteScanner 
                onScan={handleToteScan} 
                inputRef={toteInputRef}
                isLoading={isProcessing}
                disabled={!isScanningActive}
                placeholder={isScanningActive ? "Scan or enter tote ID" : "Start scanning process first"}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="consignment" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {!selectedConsignmentId ? (
              <ConsignmentSelector
                currentFacility={userFacility}
                onSelectConsignment={handleConsignmentSelection}
                isLoading={isProcessing}
                disabled={isScanningActive}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    className="w-full" 
                    variant="destructive" 
                    onClick={completeInbound}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Consignment Inbound"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <div className="md:col-span-2">
              <ToteScanner 
                onScan={handleToteScan} 
                inputRef={toteInputRef}
                isLoading={isProcessing}
                disabled={!isScanningActive || !selectedConsignmentId}
                placeholder={isScanningActive ? "Scan consignment totes" : "Select a consignment first"}
              />
            </div>
          </div>
          
          {selectedConsignmentId && (
            <ConsignmentDetailsPanel
              consignmentId={selectedConsignmentId}
              sourceFacility={consignmentSource}
              expectedToteCount={expectedToteCount}
              receivedToteCount={recentScans.length}
            />
          )}
        </TabsContent>
      </Tabs>
      
      <ToteTable
        totes={recentScans}
        title="Recent Inbound Scans"
        isLoading={isLoading}
        hideDestination
        hideGrid
      />
      
      <DiscrepancyAlert 
        isOpen={showDiscrepancyAlert} 
        onClose={() => setShowDiscrepancyAlert(false)}
        onConfirm={finalizeInbound}
        expectedCount={expectedToteCount}
        actualCount={recentScans.length}
      />
    </div>
  );
};

export default InboundProcessingForm;
