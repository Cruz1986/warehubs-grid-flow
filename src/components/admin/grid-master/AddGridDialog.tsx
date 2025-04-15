
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Grid } from 'lucide-react';
import { toast } from 'sonner';
import MappingSelector from './MappingSelector';
import GridNumberField from './GridNumberField';

interface GridMapping {
  id: string;
  source: string;
  destination: string;
  facility: string;
  gridNumbers: string[];
}

interface AddGridDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGridAdded: (mappingId: string, gridNumber: string) => void;
  facilities: string[];
}

const AddGridDialog: React.FC<AddGridDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onGridAdded,
  facilities
}) => {
  const [newGrid, setNewGrid] = useState({
    mappingId: '',
    gridNumber: '',
  });
  
  // Create a mock mapping or use an empty array
  // This is a temporary solution until we implement proper mappings
  const gridMappings: GridMapping[] = facilities.map((facility, index) => ({
    id: `mapping-${index}`,
    source: 'Default Source',
    destination: facility,
    facility: facility,
    gridNumbers: []
  }));

  const handleAddGrid = () => {
    if (!newGrid.mappingId || !newGrid.gridNumber) {
      toast.error("Please select a mapping and enter a grid number");
      return;
    }
    
    // Check if grid number already exists in this mapping
    const mapping = gridMappings.find(m => m.id === newGrid.mappingId);
    if (mapping && mapping.gridNumbers.includes(newGrid.gridNumber)) {
      toast.error(`Grid number ${newGrid.gridNumber} already exists in this mapping`);
      return;
    }
    
    // Add grid to mapping
    onGridAdded(newGrid.mappingId, newGrid.gridNumber);
    
    // Reset form and close dialog
    setNewGrid({
      mappingId: '',
      gridNumber: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Grid className="h-4 w-4 mr-2" />
          Assign Grid
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Grid to Source-Destination Mapping</DialogTitle>
          <DialogDescription>
            Add a grid number to a specific source-destination mapping.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <MappingSelector 
            mappings={gridMappings}
            selectedMappingId={newGrid.mappingId}
            onSelectMapping={(mappingId) => setNewGrid({...newGrid, mappingId})}
          />
          
          <GridNumberField
            gridNumber={newGrid.gridNumber}
            onChange={(gridNumber) => setNewGrid({...newGrid, gridNumber})}
            disabled={!newGrid.mappingId}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddGrid}>
            Assign Grid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGridDialog;
