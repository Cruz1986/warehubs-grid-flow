
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, PackageCheck } from 'lucide-react';
import ToteScanner from './ToteScanner';
import FacilitySelector from './FacilitySelector';
import { supabase } from '@/integrations/supabase/client';
import ToteTable from './ToteTable';
import { Tote } from './ToteTable';

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
  
  // Get current user info from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const username = user?.username || 'unknown';
  
  // Focus on the tote input when scanning is active
  useEffect(() => {
    if (isScanningActive && toteInputRef.current) {
      toteInputRef.current.focus();
    }
  }, [isScanningActive]);

  const startScanning = () => {
    if (!selectedFacility) {
      toast.error("Please select a source facility before starting");
      return;
    }
    
    setIsScanningActive(true);
    toast.success(`Started scanning from ${selectedFacility}`);
    
    // Focus on tote input with a slight delay
    setTimeout(() => {
      if (toteInputRef.current) {
        toteInputRef.current.focus();
      }
    }, 100);
  };

  const completeInbound = async () => {
    if (recentScans.length === 0) {
      toast.warning("No totes have been scanned yet");
      return;
    }
    
    toast.success(`Completed inbound process from ${selectedFacility}`);
    
    // Reset the form
    setRecentScans([]);
    setSelectedFacility('');
    setIsScanningActive(false);
  };

  const handleToteScan = async (toteId: string) => {
    if (!isScanningActive) {
      toast.error("Please start the scanning process first");
      return;
    }
    
    // Check if tote already scanned
    if (recentScans.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been scanned`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Insert into Supabase
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
      
      // Add to local state
      const newTote: Tote = {
        id: toteId,
        status: 'inbound',
        source: selectedFacility,
        destination: userFacility,
        timestamp: new Date().toISOString(),
        user: username,
        currentFacility: userFacility
      };
      
      setRecentScans([newTote, ...recentScans]);
      toast.success(`Tote ${toteId} has been received from ${selectedFacility}`);
      
      // Refocus on tote input for continuous scanning
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
                onClick={startScanning} 
                disabled={!selectedFacility || isLoading}
              >
                Start Scanning
              </Button>
            ) : (
              <Button 
                className="w-full mt-4" 
                variant="destructive" 
                onClick={completeInbound}
              >
                Complete Inbound
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
      
      <ToteTable
        totes={recentScans}
        title="Recent Inbound Scans"
        isLoading={isLoading}
        hideDestination
        hideGrid
      />
    </div>
  );
};

export default InboundProcessingForm;
