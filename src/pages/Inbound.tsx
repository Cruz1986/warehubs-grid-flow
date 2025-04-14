
import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ToteScanner from '../components/operations/ToteScanner';
import ToteTable from '../components/operations/ToteTable';
import FacilitySelector from '../components/operations/FacilitySelector';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

// Mock facilities - would be fetched from Google Sheets
const facilities = ['Facility A', 'Facility B', 'Facility C', 'Facility D'];

const Inbound = () => {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [scannedTotes, setScannedTotes] = useState<any[]>([]);
  
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  const handleToteScan = (toteId: string) => {
    if (!selectedFacility) {
      toast.error("Please select a source facility first");
      return;
    }
    
    // Check if tote already scanned
    if (scannedTotes.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been scanned`);
      return;
    }
    
    // Get current timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    // Create new tote record
    const newTote = {
      id: toteId,
      status: 'inbound',
      source: selectedFacility,
      destination: user?.facility || '',
      timestamp,
      user: user?.username || 'unknown',
    };
    
    // Add to scanned totes list
    setScannedTotes([newTote, ...scannedTotes]);
    toast.success(`Tote ${toteId} has been received from ${selectedFacility}`);
    
    // In a real app, this would also save to Google Sheets
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Inbound Processing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <FacilitySelector
              facilities={facilities}
              selectedFacility={selectedFacility}
              onChange={setSelectedFacility}
              label="Source Facility"
            />
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <ToteScanner onScan={handleToteScan} />
        </div>
      </div>
      
      <ToteTable
        totes={scannedTotes}
        title="Today's Inbound Totes"
      />
    </DashboardLayout>
  );
};

export default Inbound;
