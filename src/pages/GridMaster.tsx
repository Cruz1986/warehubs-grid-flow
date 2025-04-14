
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import GridMasterComponent from '../components/admin/GridMasterComponent';

const GridMaster = () => {
  return (
    <DashboardLayout requireAdmin={true}>
      <h1 className="text-2xl font-bold mb-6">Grid Master Management</h1>
      <GridMasterComponent />
    </DashboardLayout>
  );
};

export default GridMaster;
