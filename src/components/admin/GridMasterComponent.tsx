
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { AddFacilityDialog } from "./grid-master/AddFacilityDialog";
import AddGridDialog from "./grid-master/AddGridDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FacilityList from "./grid-master/FacilityList";

export type Facility = {
  id: string;
  name: string;
  type: string;
  location?: string | null;
};

export type FacilityType = "Fulfilment_Center" | "Sourcing_Hub" | "Dark_Store";

export const GridMasterComponent = () => {
  const [showAddFacilityDialog, setShowAddFacilityDialog] = useState(false);
  const [showAddGridDialog, setShowAddGridDialog] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('facility_master')
        .select("*");

      if (error) {
        throw error;
      }

      if (data) {
        const formattedFacilities = data.map((facility) => ({
          id: facility.id,
          name: facility.name,
          type: facility.type,
          location: facility.location,
        }));
        setFacilities(formattedFacilities);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
      toast.error("Failed to load facilities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Grid Master</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFacilities}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowAddFacilityDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowAddGridDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Grid
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <FacilityList 
            facilities={facilities} 
            isLoading={isLoading} 
            onFacilityAdded={fetchFacilities}
          />
        </CardContent>
      </Card>

      <AddFacilityDialog
        open={showAddFacilityDialog}
        onOpenChange={setShowAddFacilityDialog}
        onFacilityAdded={fetchFacilities}
      />

      <AddGridDialog
        isOpen={showAddGridDialog}
        onOpenChange={setShowAddGridDialog}
        onGridAdded={() => {
          toast.success(`Grid assigned successfully`);
          // Refresh data if needed
        }}
        facilities={facilities}
      />
    </div>
  );
};

export default GridMasterComponent;
