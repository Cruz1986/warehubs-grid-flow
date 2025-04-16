
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FacilityMaster from '../grid-master/FacilityMaster';
import GridAssignment from '../grid-master/GridAssignment';
import { Facility } from '../GridMasterComponent';

interface GridMapping {
  id: string;
  source_name: string;
  destination_name: string;
  grid_no: string;
}

interface GridMasterTabsProps {
  facilities: Facility[];
  gridMappings: GridMapping[];
  isLoading: boolean;
  onFacilityAdded: (facility: Facility) => void;
  onFacilityDeleted: (facilityId: string) => void;
  onGridAssigned: (mapping: GridMapping) => void;
  onGridDeleted: (mappingId: string) => void;
}

const GridMasterTabs: React.FC<GridMasterTabsProps> = ({
  facilities,
  gridMappings,
  isLoading,
  onFacilityAdded,
  onFacilityDeleted,
  onGridAssigned,
  onGridDeleted
}) => {
  return (
    <Tabs defaultValue="facilities" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="facilities">Facility Master</TabsTrigger>
        <TabsTrigger value="grid-assignment">Grid Assignment</TabsTrigger>
      </TabsList>
      <TabsContent value="facilities" className="mt-6">
        <FacilityMaster 
          facilities={facilities} 
          onFacilityAdded={onFacilityAdded} 
          onFacilityDeleted={onFacilityDeleted}
          isLoading={isLoading}
        />
      </TabsContent>
      <TabsContent value="grid-assignment" className="mt-6">
        <GridAssignment 
          facilities={facilities} 
          gridMappings={gridMappings}
          onGridAssigned={onGridAssigned}
          onGridDeleted={onGridDeleted}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
};

export default GridMasterTabs;
