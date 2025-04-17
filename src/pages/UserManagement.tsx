
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import UserManagementTable from '../components/admin/UserManagementTable';

const UserManagement = () => {
  // Get current user from localStorage
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setUser(userData);
        
        // Make role checks case-insensitive
        const userRole = userData?.role?.toLowerCase();
        setIsAdmin(userRole === 'admin');
        setIsManager(userRole === 'manager');
        setHasAccess(userRole === 'admin' || userRole === 'manager');
        
        console.log('User management page - Current user:', userData);
        console.log('User role:', userRole);
        console.log('Has access:', userRole === 'admin' || userRole === 'manager');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <p className="text-gray-600 mb-4">
        Create and manage users for the warehouse management system. 
        Each user can be assigned to a specific facility.
      </p>
      
      {hasAccess ? (
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
