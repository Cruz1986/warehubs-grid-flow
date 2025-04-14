
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Edit, Trash } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

// Mock data for now, would be replaced with data from Supabase
const mockFacilities = ['Facility A', 'Facility B', 'Facility C', 'Facility D'];

interface GridMapping {
  id: string;
  source: string;
  destination: string;
  facility: string;
  gridNumbers: string[];
}

const GridMasterComponent = () => {
  const [gridMappings, setGridMappings] = useState<GridMapping[]>([
    { 
      id: '1', 
      source: 'Source A', 
      destination: 'Destination X', 
      facility: 'Facility A',
      gridNumbers: ['A1', 'A2', 'A3'] 
    },
    { 
      id: '2', 
      source: 'Source B', 
      destination: 'Destination Y', 
      facility: 'Facility B',
      gridNumbers: ['B1', 'B2'] 
    },
  ]);
  
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);
  const [isEditMappingOpen, setIsEditMappingOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<GridMapping | null>(null);
  const [isAddGridOpen, setIsAddGridOpen] = useState(false);
  
  // Form states
  const [newMapping, setNewMapping] = useState({
    source: '',
    destination: '',
    facility: '',
  });
  
  const [newGrid, setNewGrid] = useState({
    mappingId: '',
    gridNumber: '',
  });

  // Sources and destinations lists
  const [sources, setSources] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);

  // Fetch sources and destinations from Supabase in a real implementation
  useEffect(() => {
    // Extract unique sources and destinations from existing mappings
    const uniqueSources = [...new Set(gridMappings.map(mapping => mapping.source))];
    const uniqueDestinations = [...new Set(gridMappings.map(mapping => mapping.destination))];
    
    setSources(uniqueSources);
    setDestinations(uniqueDestinations);
  }, [gridMappings]);

  const handleAddMapping = () => {
    // Validate form
    if (!newMapping.source || !newMapping.destination || !newMapping.facility) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Add mapping (in production, this would call your Supabase API)
    const newId = (gridMappings.length + 1).toString();
    setGridMappings([...gridMappings, { 
      id: newId, 
      source: newMapping.source, 
      destination: newMapping.destination, 
      facility: newMapping.facility,
      gridNumbers: []
    }]);
    
    // Update sources and destinations lists if needed
    if (!sources.includes(newMapping.source)) {
      setSources([...sources, newMapping.source]);
    }
    
    if (!destinations.includes(newMapping.destination)) {
      setDestinations([...destinations, newMapping.destination]);
    }
    
    // Reset form and close dialog
    setNewMapping({
      source: '',
      destination: '',
      facility: '',
    });
    setIsAddMappingOpen(false);
    toast.success("Mapping added successfully");
  };

  const handleEditMapping = () => {
    if (!selectedMapping) return;
    
    // Validate form
    if (!selectedMapping.source || !selectedMapping.destination || !selectedMapping.facility) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Update mapping
    setGridMappings(gridMappings.map(mapping => 
      mapping.id === selectedMapping.id ? selectedMapping : mapping
    ));
    
    // Update sources and destinations lists if needed
    if (!sources.includes(selectedMapping.source)) {
      setSources([...sources, selectedMapping.source]);
    }
    
    if (!destinations.includes(selectedMapping.destination)) {
      setDestinations([...destinations, selectedMapping.destination]);
    }
    
    setIsEditMappingOpen(false);
    toast.success("Mapping updated successfully");
  };

  const handleDeleteMapping = (mapping: GridMapping) => {
    setGridMappings(gridMappings.filter(m => m.id !== mapping.id));
    toast.success(`Mapping from ${mapping.source} to ${mapping.destination} deleted`);
  };

  const handleAddGrid = () => {
    if (!newGrid.mappingId || !newGrid.gridNumber) {
      toast.error("Please select a mapping and enter a grid number");
      return;
    }
    
    // Add grid to mapping
    setGridMappings(gridMappings.map(mapping => 
      mapping.id === newGrid.mappingId 
        ? { ...mapping, gridNumbers: [...mapping.gridNumbers, newGrid.gridNumber] }
        : mapping
    ));
    
    // Reset form and close dialog
    setNewGrid({
      mappingId: '',
      gridNumber: '',
    });
    setIsAddGridOpen(false);
    toast.success("Grid added successfully");
  };

  const handleDeleteGrid = (mappingId: string, gridNumber: string) => {
    setGridMappings(gridMappings.map(mapping => 
      mapping.id === mappingId 
        ? { ...mapping, gridNumbers: mapping.gridNumbers.filter(g => g !== gridNumber) }
        : mapping
    ));
    toast.success(`Grid ${gridNumber} removed`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Grid Mappings</h2>
        <div className="flex space-x-2">
          <Dialog open={isAddMappingOpen} onOpenChange={setIsAddMappingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Mapping
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Grid Mapping</DialogTitle>
                <DialogDescription>
                  Create a new source to destination mapping.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={newMapping.source}
                    onChange={(e) => setNewMapping({...newMapping, source: e.target.value})}
                    placeholder="Enter source"
                    list="sources-list"
                  />
                  <datalist id="sources-list">
                    {sources.map((source) => (
                      <option key={source} value={source} />
                    ))}
                  </datalist>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={newMapping.destination}
                    onChange={(e) => setNewMapping({...newMapping, destination: e.target.value})}
                    placeholder="Enter destination"
                    list="destinations-list"
                  />
                  <datalist id="destinations-list">
                    {destinations.map((destination) => (
                      <option key={destination} value={destination} />
                    ))}
                  </datalist>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="facility">Facility</Label>
                  <Select
                    value={newMapping.facility}
                    onValueChange={(value) => setNewMapping({...newMapping, facility: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFacilities.map((facility) => (
                        <SelectItem key={facility} value={facility}>
                          {facility}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMappingOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMapping}>
                  Add Mapping
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddGridOpen} onOpenChange={setIsAddGridOpen}>
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
                <Button variant="outline" onClick={() => setIsAddGridOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGrid}>
                  Add Grid
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {gridMappings.map((mapping) => (
          <Card key={mapping.id} className="overflow-hidden">
            <div className="bg-slate-50 p-4 flex justify-between items-center border-b">
              <div>
                <h3 className="text-lg font-medium">
                  {mapping.source} → {mapping.destination}
                </h3>
                <p className="text-sm text-gray-500">Facility: {mapping.facility}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedMapping(mapping);
                    setIsEditMappingOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteMapping(mapping)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Assigned Grids</h4>
              {mapping.gridNumbers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mapping.gridNumbers.map((grid) => (
                    <div key={grid} className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-blue-700 mr-2">{grid}</span>
                      <button
                        onClick={() => handleDeleteGrid(mapping.id, grid)}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No grids assigned</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Edit Mapping Dialog */}
      <Dialog open={isEditMappingOpen} onOpenChange={setIsEditMappingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Grid Mapping</DialogTitle>
            <DialogDescription>
              Update the source to destination mapping.
            </DialogDescription>
          </DialogHeader>
          {selectedMapping && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-source">Source</Label>
                <Input
                  id="edit-source"
                  value={selectedMapping.source}
                  onChange={(e) => setSelectedMapping({...selectedMapping, source: e.target.value})}
                  placeholder="Enter source"
                  list="edit-sources-list"
                />
                <datalist id="edit-sources-list">
                  {sources.map((source) => (
                    <option key={source} value={source} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-destination">Destination</Label>
                <Input
                  id="edit-destination"
                  value={selectedMapping.destination}
                  onChange={(e) => setSelectedMapping({...selectedMapping, destination: e.target.value})}
                  placeholder="Enter destination"
                  list="edit-destinations-list"
                />
                <datalist id="edit-destinations-list">
                  {destinations.map((destination) => (
                    <option key={destination} value={destination} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-facility">Facility</Label>
                <Select
                  value={selectedMapping.facility}
                  onValueChange={(value) => setSelectedMapping({...selectedMapping, facility: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFacilities.map((facility) => (
                      <SelectItem key={facility} value={facility}>
                        {facility}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMappingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMapping}>
              Update Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GridMasterComponent;
