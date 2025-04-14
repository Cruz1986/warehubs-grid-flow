
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import UserManagementTable from '../components/admin/UserManagementTable';

const UserManagement = () => {
  return (
    <DashboardLayout requireAdmin={true}>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserManagementTable />
    </DashboardLayout>
  );
};

export default UserManagement;
