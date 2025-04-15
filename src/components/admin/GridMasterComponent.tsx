
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { AddGridDialog } from "./grid-master/AddGridDialog";
import { AddFacilityDialog } from "./grid-master/AddFacilityDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const GridMasterComponent = () => {
  const [showAddFacilityDialog, setShowAddFacilityDialog] = useState(false);
  const [showAddGridDialog, setShowAddGridDialog] = useState(false);
  const [facilities, setFacilities] = useState<any[]>([]);
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

  const facilityTypeColors: Record<string, string> = {
    "Fulfilment_Center": "blue",
    "Sourcing_Hub": "green",
    "Dark_Store": "purple",
  };

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
          <Button size="sm" onClick={() => setShowAddFacilityDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
          <Button size="sm" onClick={() => setShowAddGridDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Grid
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => (
          <Card key={facility.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center text-lg">
                <span>{facility.name}</span>
                <Badge
                  className={`bg-${
                    facilityTypeColors[facility.type]
                  }-100 text-${facilityTypeColors[facility.type]}-800`}
                >
                  {facility.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Location: {facility.location || "Not specified"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Loading facilities...</p>
        </div>
      )}

      {!isLoading && facilities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            No facilities found. Add your first facility to get started.
          </p>
        </div>
      )}

      <AddFacilityDialog
        open={showAddFacilityDialog}
        onOpenChange={setShowAddFacilityDialog}
        onFacilityAdded={fetchFacilities}
      />

      <AddGridDialog
        open={showAddGridDialog}
        onOpenChange={setShowAddGridDialog}
        onGridAdded={() => {}}
        facilities={facilities.map((f) => f.name)}
      />
    </div>
  );
};
