
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Facility, FacilityType } from '../GridMasterComponent';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Grid, Trash2 } from 'lucide-react';

interface GridMapping {
  id: string;
  source: string;
  sourceType: FacilityType;
  destination: string;
  destinationType: FacilityType;
  gridNumber: string;
}

interface GridAssignmentProps {
  facilities: Facility[];
  isLoading: boolean;
}

const GridAssignment: React.FC<GridAssignmentProps> = ({ facilities, isLoading }) => {
  const [facilityType, setFacilityType] = useState<string>('');
  const [sourceFacility, setSourceFacility] = useState<string>('');
  const [destinationFacility, setDestinationFacility] = useState<string>('');
  const [gridNumber, setGridNumber] = useState<string>('');
  const [gridMappings, setGridMappings] = useState<GridMapping[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const facilitiesByType = (type: string) => {
    return facilities.filter(f => f.type === type);
  };

  const handleAssignGrid = async () => {
    if (!facilityType || !sourceFacility || !destinationFacility || !gridNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedSource = facilities.find(f => f.id === sourceFacility);
      const selectedDestination = facilities.find(f => f.id === destinationFacility);
      
      if (!selectedSource || !selectedDestination) {
        toast.error('Invalid source or destination facility');
        return;
      }

      // In a real application, we would save this to the database
      // For now, we'll just add it to our local state
      const newMapping: GridMapping = {
        id: Date.now().toString(), // Use a real ID in production
        source: selectedSource.name,
        sourceType: selectedSource.type,
        destination: selectedDestination.name,
        destinationType: selectedDestination.type,
        gridNumber
      };
      
      setGridMappings([...gridMappings, newMapping]);
      toast.success(`Grid ${gridNumber} assigned successfully`);
      
      // Reset form
      setGridNumber('');
    } catch (error) {
      console.error('Error assigning grid:', error);
      toast.error('Failed to assign grid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMapping = (mappingId: string) => {
    if (window.confirm('Are you sure you want to delete this grid mapping?')) {
      setGridMappings(gridMappings.filter(m => m.id !== mappingId));
      toast.success('Grid mapping deleted successfully');
    }
  };

  const typeToFacilities = {
    'Fulfillment Center': facilitiesByType('Fulfillment Center'),
    'Sourcing Hub': facilitiesByType('Sourcing Hub'),
    'Darkstore': facilitiesByType('Darkstore')
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grid Assignment</CardTitle>
        <CardDescription>
          Assign grid numbers to source-destination facility pairs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">Loading facilities...</div>
        ) : facilities.length < 2 ? (
          <div className="text-center py-6 text-gray-500">
            You need at least two facilities to create a grid mapping. Please add facilities first.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <Label htmlFor="facility-type">Facility Type</Label>
                <Select
                  value={facilityType}
                  onValueChange={(value) => {
                    setFacilityType(value);
                    setSourceFacility('');
                  }}
                >
                  <SelectTrigger id="facility-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fulfillment Center">Fulfillment Center</SelectItem>
                    <SelectItem value="Sourcing Hub">Sourcing Hub</SelectItem>
                    <SelectItem value="Darkstore">Darkstore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="source-facility">Source Facility</Label>
                <Select
                  value={sourceFacility}
                  onValueChange={setSourceFacility}
                  disabled={!facilityType || typeToFacilities[facilityType as FacilityType].length === 0}
                >
                  <SelectTrigger id="source-facility">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilityType && typeToFacilities[facilityType as FacilityType].map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="destination-facility">Destination Facility</Label>
                <Select
                  value={destinationFacility}
                  onValueChange={setDestinationFacility}
                  disabled={!sourceFacility}
                >
                  <SelectTrigger id="destination-facility">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities
                      .filter(f => f.id !== sourceFacility) // Exclude the source facility
                      .map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name} ({facility.type})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="grid-number">Grid Number</Label>
                  <Input
                    id="grid-number"
                    value={gridNumber}
                    onChange={(e) => setGridNumber(e.target.value)}
                    placeholder="Enter grid #"
                    disabled={!destinationFacility}
                  />
                </div>
                <Button 
                  onClick={handleAssignGrid} 
                  disabled={!gridNumber || isSubmitting}
                  className="mb-0.5"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              </div>
            </div>
            
            {gridMappings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source Facility</TableHead>
                    <TableHead>Destination Facility</TableHead>
                    <TableHead>Grid Number</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gridMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        {mapping.source} <span className="text-xs text-gray-500">({mapping.sourceType})</span>
                      </TableCell>
                      <TableCell>
                        {mapping.destination} <span className="text-xs text-gray-500">({mapping.destinationType})</span>
                      </TableCell>
                      <TableCell className="font-medium">{mapping.gridNumber}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMapping(mapping.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No grid mappings configured yet. Use the form above to assign grids.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GridAssignment;
