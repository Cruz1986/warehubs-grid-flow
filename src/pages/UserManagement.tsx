
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import UserManagementTable from '../components/admin/UserManagementTable';

const UserManagement = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <p className="text-gray-600 mb-4">
        Create and manage users for the warehouse management system. 
        Each user can be assigned to a specific facility.
      </p>
      
      <UserManagementTable />
    </DashboardLayout>
  );
};

export default UserManagement;
