
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ToteScanner from '../components/operations/ToteScanner';
import ToteTable from '../components/operations/ToteTable';
import FacilitySelector from '../components/operations/FacilitySelector';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PackageCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Type definition for Facility
interface Facility {
  id: string;
  name: string;
  type: string;
  location?: string;
}

const Outbound = () => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [outboundTotes, setOutboundTotes] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Fetch facilities from Supabase
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('facilities')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        setFacilities(data);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        toast.error('Failed to load facilities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  // Extract facility names for the selector
  const facilityNames = facilities.map(facility => facility.name);
  
  const handleToteScan = (toteId: string) => {
    if (!selectedDestination) {
      toast.error("Please select a destination facility first");
      return;
    }
    
    // Check if tote already processed
    if (outboundTotes.some(tote => tote.id === toteId)) {
      toast.error(`Tote ${toteId} has already been processed for outbound`);
      return;
    }
    
    // Get current timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    // Create new tote record
    const newTote = {
      id: toteId,
      status: 'outbound',
      source: user?.facility || '',
      destination: selectedDestination,
      timestamp,
      user: user?.username || 'unknown',
    };
    
    // Add to outbound totes list
    setOutboundTotes([newTote, ...outboundTotes]);
    toast.success(`Tote ${toteId} has been shipped to ${selectedDestination}`);
    
    // In a real app, this would also save to Google Sheets
  };
  
  // Mock data for pending totes - in a real app, this would be fetched
  const pendingTotesByDestination = {
    'Facility A': ['TOTE100001', 'TOTE100002'],
    'Facility B': ['TOTE100003', 'TOTE100004', 'TOTE100005'],
    'Facility C': ['TOTE100006'],
    'Facility D': [],
  };
  
  const pendingTotes = selectedDestination 
    ? pendingTotesByDestination[selectedDestination as keyof typeof pendingTotesByDestination] || []
    : [];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Outbound Processing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <FacilitySelector
              facilities={facilityNames}
              selectedFacility={selectedDestination}
              onChange={setSelectedDestination}
              label="Destination Facility"
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <ToteScanner 
            onScan={handleToteScan}
            placeholder="Scan tote for outbound"
          />
        </div>
      </div>
      
      {selectedDestination && pendingTotes.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <PackageCheck className="mr-2 h-5 w-5 text-yellow-600" />
              Pending Totes for {selectedDestination}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pendingTotes.map(toteId => (
                <div key={toteId} className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-1">
                  {toteId}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <ToteTable
        totes={outboundTotes}
        title="Today's Outbound Totes"
      />
    </DashboardLayout>
  );
};

export default Outbound;
