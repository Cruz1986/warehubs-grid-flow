
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import UserManagementTable from '../components/admin/UserManagementTable';

const UserManagement = () => {
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Fix: make role check case-insensitive
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  
  return (
    <DashboardLayout requireAdmin={false}>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <p className="text-gray-600 mb-4">
        Create and manage users for the warehouse management system. 
        Each user can be assigned to a specific facility.
      </p>
      
      {isAdmin ? (
        <UserManagementTable />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <p className="text-yellow-700">
            You do not have permission to manage users. Please contact an administrator.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;
