
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PackageCheck, Loader2, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ConsignmentSelectorProps {
  currentFacility: string;
  onSelectConsignment: (consignmentId: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ConsignmentSelector: React.FC<ConsignmentSelectorProps> = ({
  currentFacility,
  onSelectConsignment,
  isLoading,
  disabled = false
}) => {
  const [availableConsignments, setAvailableConsignments] = useState<{id: string, source: string, toteCount: number, createdAt: string}[]>([]);
  const [selectedConsignmentId, setSelectedConsignmentId] = useState<string>('');
  const [isLoadingConsignments, setIsLoadingConsignments] = useState<boolean>(false);

  useEffect(() => {
    const fetchConsignments = async () => {
      setIsLoadingConsignments(true);
      try {
        const { data, error } = await supabase
          .from('consignment_log')
          .select('consignment_id, source_facility, tote_count, created_at')
          .eq('destination_facility', currentFacility)
          .in('status', ['intransit', 'pending'])
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching consignments:', error);
          toast.error('Failed to load available consignments');
          return;
        }
        
        console.log("Fetched consignments for inbound:", data);
        
        const formattedConsignments = data.map(item => ({
          id: item.consignment_id,
          source: item.source_facility,
          toteCount: item.tote_count || 0,
          createdAt: item.created_at
        }));
        
        setAvailableConsignments(formattedConsignments);
      } catch (err) {
        console.error('Error in consignment fetch:', err);
        toast.error('Failed to load available consignments');
      } finally {
        setIsLoadingConsignments(false);
      }
    };
    
    fetchConsignments();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('consignment-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'consignment_log' }, 
        (payload) => {
          console.log('Consignment update detected:', payload);
          fetchConsignments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentFacility]);

  const handleStartReceiving = () => {
    if (!selectedConsignmentId) {
      toast.warning('Please select a consignment first');
      return;
    }
    onSelectConsignment(selectedConsignmentId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Truck className="mr-2 h-5 w-5" />
          Incoming Consignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableConsignments.length === 0 ? (
          <div className="p-4 text-center text-gray-500 border border-dashed rounded-md">
            No pending consignments available
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="consignment">Select Consignment</Label>
            <Select
              disabled={isLoadingConsignments || disabled}
              value={selectedConsignmentId}
              onValueChange={setSelectedConsignmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a consignment" />
              </SelectTrigger>
              <SelectContent>
                {availableConsignments.map((consignment) => (
                  <SelectItem key={consignment.id} value={consignment.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        {consignment.id.substring(0, 10)}... 
                        <Badge variant="outline" className="ml-2">{consignment.toteCount} totes</Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {consignment.source}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedConsignmentId && (
              <div className="p-3 bg-blue-50 rounded-md text-xs">
                <p>From: {availableConsignments.find(c => c.id === selectedConsignmentId)?.source}</p>
                <p>Created: {formatDate(availableConsignments.find(c => c.id === selectedConsignmentId)?.createdAt || '')}</p>
                <p>Totes: {availableConsignments.find(c => c.id === selectedConsignmentId)?.toteCount}</p>
              </div>
            )}
          </div>
        )}
        
        <Button 
          className="w-full"
          onClick={handleStartReceiving}
          disabled={!selectedConsignmentId || isLoading || disabled || isLoadingConsignments}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Start Receiving"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConsignmentSelector;
