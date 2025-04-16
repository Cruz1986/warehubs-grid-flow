
import React from 'react';
import GridMasterTabs from './grid-master/GridMasterTabs';
import { useFacilityManagement } from '@/hooks/useFacilityManagement';
import { useGridMappingManagement } from '@/hooks/useGridMappingManagement';

export type FacilityType = 'Fulfilment_Center' | 'Sourcing_Hub' | 'Dark_Store';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location?: string;
}

const GridMasterComponent = () => {
  const { 
    facilities, 
    isLoading, 
    handleFacilityAdded, 
    handleFacilityDeleted 
  } = useFacilityManagement();
  
  const { 
    gridMappings, 
    handleGridAssigned, 
    handleGridDeleted 
  } = useGridMappingManagement();

  return (
    <div className="space-y-6">
      <GridMasterTabs 
        facilities={facilities}
        gridMappings={gridMappings}
        isLoading={isLoading}
        onFacilityAdded={handleFacilityAdded}
        onFacilityDeleted={handleFacilityDeleted}
        onGridAssigned={handleGridAssigned}
        onGridDeleted={handleGridDeleted}
      />
    </div>
  );
};

export default GridMasterComponent;
