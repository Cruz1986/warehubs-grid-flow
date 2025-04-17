// Update file: src/pages/UserManagement.tsx

import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import UserManagementTable from '../components/admin/UserManagementTable';
import { AuthProvider } from '../contexts/AuthContext';

const UserManagement = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <p className="text-gray-600 mb-4">
        Create and manage users for the warehouse management system. 
        Each user can be assigned to a specific facility.
      </p>
      
      <AuthProvider>
        <UserManagementTable />
      </AuthProvider>
    </DashboardLayout>
  );
};

export default UserManagement;