
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import GridMasterComponent from '../components/admin/GridMasterComponent';

const GridMaster = () => {
  return (
    <DashboardLayout requireAdmin={true}>
      <div className="space-y-4">
        <p className="text-gray-600">
          Manage facilities (Fulfillment Centers, Sourcing Hubs, Darkstores) and assign grid numbers to source-destination pairs.
        </p>
        <div className="bg-white rounded-lg p-4">
          <GridMasterComponent />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GridMaster;
