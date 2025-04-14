
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import AddMappingDialog from './grid-master/AddMappingDialog';
import AddGridDialog from './grid-master/AddGridDialog';
import EditMappingDialog from './grid-master/EditMappingDialog';
import GridMappingCard from './grid-master/GridMappingCard';

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
  
  const [isEditMappingOpen, setIsEditMappingOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<GridMapping | null>(null);
  
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

  const handleAddMapping = (newMapping: { source: string; destination: string; facility: string }) => {
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
    
    toast.success("Mapping added successfully");
  };

  const handleUpdateMapping = (mapping: GridMapping) => {
    // Validate form
    if (!mapping.source || !mapping.destination || !mapping.facility) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Update mapping
    setGridMappings(gridMappings.map(m => 
      m.id === mapping.id ? mapping : m
    ));
    
    // Update sources and destinations lists if needed
    if (!sources.includes(mapping.source)) {
      setSources([...sources, mapping.source]);
    }
    
    if (!destinations.includes(mapping.destination)) {
      setDestinations([...destinations, mapping.destination]);
    }
    
    setIsEditMappingOpen(false);
    toast.success("Mapping updated successfully");
  };

  const handleDeleteMapping = (mapping: GridMapping) => {
    setGridMappings(gridMappings.filter(m => m.id !== mapping.id));
    toast.success(`Mapping from ${mapping.source} to ${mapping.destination} deleted`);
  };

  const handleAddGrid = (mappingId: string, gridNumber: string) => {
    // Add grid to mapping
    setGridMappings(gridMappings.map(mapping => 
      mapping.id === mappingId 
        ? { ...mapping, gridNumbers: [...mapping.gridNumbers, gridNumber] }
        : mapping
    ));
    
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

  const handleEditMapping = (mapping: GridMapping) => {
    setSelectedMapping(mapping);
    setIsEditMappingOpen(true);
  };

  const handleChangeMapping = (mapping: GridMapping) => {
    setSelectedMapping(mapping);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Grid Mappings</h2>
        <div className="flex space-x-2">
          <AddMappingDialog 
            sources={sources} 
            destinations={destinations} 
            onAddMapping={handleAddMapping} 
          />
          
          <AddGridDialog 
            gridMappings={gridMappings}
            onAddGrid={handleAddGrid}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {gridMappings.map((mapping) => (
          <GridMappingCard
            key={mapping.id}
            mapping={mapping}
            onEditMapping={handleEditMapping}
            onDeleteMapping={handleDeleteMapping}
            onDeleteGrid={handleDeleteGrid}
          />
        ))}
      </div>
      
      <EditMappingDialog
        isOpen={isEditMappingOpen}
        onOpenChange={setIsEditMappingOpen}
        selectedMapping={selectedMapping}
        onUpdateMapping={handleUpdateMapping}
        onChangeMapping={handleChangeMapping}
        sources={sources}
        destinations={destinations}
      />
    </div>
  );
};

export default GridMasterComponent;
