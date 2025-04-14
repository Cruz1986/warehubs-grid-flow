
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

const GridMaster = () => {
  return (
    <DashboardLayout requireAdmin={true}>
      <h1 className="text-2xl font-bold mb-6">Grid Master Management</h1>
      <p className="text-gray-600 mb-6">Configure source-destination mappings and grid assignments.</p>
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-center text-gray-500">No mappings configured yet. Use the controls above to add mappings.</p>
      </div>
    </DashboardLayout>
  );
};

export default GridMaster;
