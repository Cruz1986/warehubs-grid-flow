
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PackageCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [availableConsignments, setAvailableConsignments] = useState<{id: string, source: string}[]>([]);
  const [selectedConsignmentId, setSelectedConsignmentId] = useState<string>('');
  const [isLoadingConsignments, setIsLoadingConsignments] = useState<boolean>(false);

  useEffect(() => {
    const fetchConsignments = async () => {
      setIsLoadingConsignments(true);
      try {
        const { data, error } = await supabase
          .from('consignment_log')
          .select('consignment_id, source_facility')
          .eq('destination_facility', currentFacility)
          .eq('status', 'intransit')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching consignments:', error);
          toast.error('Failed to load available consignments');
          return;
        }
        
        const formattedConsignments = data.map(item => ({
          id: item.consignment_id,
          source: item.source_facility
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
        () => fetchConsignments()
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <PackageCheck className="mr-2 h-5 w-5" />
          Select Consignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="consignment">Available Consignments</Label>
          <Select
            disabled={isLoadingConsignments || disabled}
            value={selectedConsignmentId}
            onValueChange={setSelectedConsignmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a consignment" />
            </SelectTrigger>
            <SelectContent>
              {availableConsignments.length === 0 ? (
                <SelectItem value="none" disabled>No consignments available</SelectItem>
              ) : (
                availableConsignments.map((consignment) => (
                  <SelectItem key={consignment.id} value={consignment.id}>
                    {consignment.id} (from {consignment.source})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
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
