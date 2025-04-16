
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Facility } from '../GridMasterComponent';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import GridMappingsTable from './GridMappingsTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AddGridMappingDialog from './AddGridMappingDialog';

interface GridMapping {
  id: string;
  source_name: string;
  destination_name: string;
  grid_no: string;
}

interface GridAssignmentProps {
  facilities: Facility[];
  gridMappings: GridMapping[];
  onGridAssigned: (mapping: GridMapping) => void;
  onGridDeleted: (mappingId: string) => void;
  isLoading: boolean;
}

const GridAssignment: React.FC<GridAssignmentProps> = ({ 
  facilities, 
  gridMappings,
  onGridAssigned,
  onGridDeleted,
  isLoading 
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleDeleteMapping = async (mappingId: string) => {
    if (window.confirm('Are you sure you want to delete this grid mapping?')) {
      try {
        const { error } = await supabase
          .from('grid_master')
          .delete()
          .eq('id', mappingId);
        
        if (error) {
          console.error('Error deleting grid mapping:', error);
          toast.error('Failed to delete grid mapping');
          return;
        }
        
        onGridDeleted(mappingId);
      } catch (err) {
        console.error('Error deleting grid mapping:', err);
        toast.error('Failed to delete grid mapping');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Grid Assignment</CardTitle>
          <CardDescription>
            Assign grid numbers to source-destination facility pairs
          </CardDescription>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Grid
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">Loading facilities...</div>
        ) : facilities.length < 2 ? (
          <div className="text-center py-6 text-gray-500">
            You need at least two facilities to create a grid mapping. Please add facilities first.
          </div>
        ) : (
          <GridMappingsTable 
            gridMappings={gridMappings} 
            onDeleteMapping={handleDeleteMapping} 
          />
        )}
      </CardContent>

      {/* Add Grid Dialog */}
      <AddGridMappingDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onGridAssigned={onGridAssigned}
        facilities={facilities}
        gridMappings={gridMappings}
      />
    </Card>
  );
};

export default GridAssignment;
