
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface GridMapping {
  id: string;
  source: string;
  destination: string;
  facility: string;
  gridNumbers: string[];
}

interface AddGridDialogProps {
  gridMappings: GridMapping[];
  onAddGrid: (mappingId: string, gridNumber: string) => void;
}

const AddGridDialog: React.FC<AddGridDialogProps> = ({ gridMappings, onAddGrid }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newGrid, setNewGrid] = useState({
    mappingId: '',
    gridNumber: '',
  });

  const handleAddGrid = () => {
    if (!newGrid.mappingId || !newGrid.gridNumber) {
      toast.error("Please select a mapping and enter a grid number");
      return;
    }
    
    // Add grid to mapping
    onAddGrid(newGrid.mappingId, newGrid.gridNumber);
    
    // Reset form and close dialog
    setNewGrid({
      mappingId: '',
      gridNumber: '',
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Grid
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Grid to Mapping</DialogTitle>
          <DialogDescription>
            Assign a grid number to a source-destination mapping.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="mapping">Mapping</Label>
            <Select
              value={newGrid.mappingId}
              onValueChange={(value) => setNewGrid({...newGrid, mappingId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mapping" />
              </SelectTrigger>
              <SelectContent>
                {gridMappings.map((mapping) => (
                  <SelectItem key={mapping.id} value={mapping.id}>
                    {mapping.source} → {mapping.destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gridNumber">Grid Number</Label>
            <Input
              id="gridNumber"
              value={newGrid.gridNumber}
              onChange={(e) => setNewGrid({...newGrid, gridNumber: e.target.value})}
              placeholder="Enter grid number"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddGrid}>
            Add Grid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGridDialog;
