
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
  // Get user role from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  
  // For managers, default to grid assignment tab
  const defaultTab = isAdmin ? "facilities" : "grid-assignment";
  
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {isAdmin && <TabsTrigger value="facilities">Facility Master</TabsTrigger>}
        <TabsTrigger value="grid-assignment">Grid Assignment</TabsTrigger>
      </TabsList>
      
      {isAdmin && (
        <TabsContent value="facilities" className="mt-6">
          <FacilityMaster 
            facilities={facilities} 
            onFacilityAdded={onFacilityAdded} 
            onFacilityDeleted={onFacilityDeleted}
            isLoading={isLoading}
          />
        </TabsContent>
      )}
      
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
