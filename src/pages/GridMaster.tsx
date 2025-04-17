
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import GridMasterComponent from '../components/admin/GridMasterComponent';

const GridMaster = () => {
  return (
    <DashboardLayout requireAdmin={false}>
      <h1 className="text-2xl font-bold mb-6">Grid Master Management</h1>
      <p className="text-gray-600 mb-6">
        Manage facilities (Fulfillment Centers, Sourcing Hubs, Darkstores) and assign grid numbers to source-destination pairs.
      </p>
      <div className="bg-white rounded-lg shadow-sm">
        <GridMasterComponent />
      </div>
    </DashboardLayout>
  );
};

export default GridMaster;
