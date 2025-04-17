
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import AddUserDialog from './user-management/AddUserDialog';
import ResetPasswordDialog from './user-management/ResetPasswordDialog';
import UserTableRow from './user-management/UserTableRow';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  role: string;
  facility: string;
  lastLogin?: string;
}

const UserManagementTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    try {
      // Get and log the user directly from localStorage
      const userStr = localStorage.getItem('user');
      console.log('Raw user string from localStorage:', userStr);
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('Parsed user object:', user);
        setCurrentUser(user);
        
        // Set permission based on role
        const isAdmin = user.role?.toLowerCase() === 'admin';
        const isManager = user.role?.toLowerCase() === 'manager';
        
        setHasPermission(isAdmin || isManager);
        
        // Log role for debugging
        if (user.role) {
          console.log('User role:', user.role);
          console.log('User facility:', user.facility);
          console.log('Has permission:', isAdmin || isManager);
        }
      } else {
        console.log('No user found in localStorage');
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      setHasPermission(false);
    }
    
    // Proceed to fetch data
    fetchFacilities();
    fetchUsers();
  }, []);

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('facility_master')
        .select('name');
      
      if (error) {
        console.error('Facility fetch error:', error);
        throw error;
      }
      
      // Extract facility names from the data
      const facilityNames = data.map(facility => facility.name);
      console.log('Fetched facilities:', facilityNames);
      setFacilities(facilityNames);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to load facilities');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching users with current user:', currentUser);
      
      // If current user is a manager, only fetch users from their facility
      let query = supabase
        .from('users_log')
        .select('user_id, username, role, facility, last_login');
      
      // If user is a manager, only show users from their facility
      if (currentUser?.role?.toLowerCase() === 'manager' && currentUser?.facility !== 'All') {
        query = query.eq('facility', currentUser.facility);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error details from user fetch:', error);
        if (error.message.includes('row-level security') || error.message.includes('permission denied')) {
          console.log('Permission denied by Supabase RLS policies');
          toast.error('Database permission denied: ' + error.message);
          return;
        }
        throw error;
      }
      
      // Log the raw data for debugging
      console.log('Raw users data from database:', data);
      
      if (!data || data.length === 0) {
        console.log('No users found in database');
        setUsers([]);
        return;
      }
      
      // Map the data to our User interface format
      const mappedUsers = data.map((user) => ({
        id: user.user_id,
        username: user.username,
        role: user.role,
        facility: user.facility || 'Unknown',
        lastLogin: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'
      }));
      
      console.log('Mapped users:', mappedUsers);
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userData: {
    username: string;
    password: string;
    role: string;
    facility: string;
  }) => {
    try {
      setIsLoading(true);
      
      // Get the current user for audit trail
      const userStr = localStorage.getItem('user');
      const currentUserData = userStr ? JSON.parse(userStr) : null;
      
      if (!currentUserData) {
        console.error('No user found in localStorage when trying to add user');
        toast.error('You must be logged in to add users');
        return;
      }
      
      console.log('Adding user with data:', {...userData, password: '[REDACTED]'});
      console.log('Current user for operation:', currentUserData);
      
      // Check if user has permission to add this user
      const canAddUser = currentUserData.role?.toLowerCase() === 'admin' || 
        (currentUserData.role?.toLowerCase() === 'manager' && 
         userData.role.toLowerCase() === 'user' && 
         userData.facility === currentUserData.facility);
      
      if (!canAddUser) {
        toast.error('You do not have permission to add this type of user');
        return;
      }
      
      // Generate a new UUID for the user_id
      const newUserId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('users_log')
        .insert({
          user_id: newUserId,
          username: userData.username,
          password: userData.password,
          role: userData.role,
          facility: userData.facility,
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error adding user:', error);
        toast.error('Failed to add user: ' + error.message);
        return;
      }

      // Add the new user to the local state
      if (data && data[0]) {
        const newUser: User = {
          id: data[0].user_id,
          username: data[0].username,
          role: data[0].role,
          facility: data[0].facility || 'Unknown',
          lastLogin: 'Never'
        };
        
        setUsers([...users, newUser]);
        toast.success("User added successfully");
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    try {
      if (!selectedUser) {
        toast.error('No user selected');
        return;
      }
      
      // Get current user for audit trail
      const userStr = localStorage.getItem('user');
      const currentUserData = userStr ? JSON.parse(userStr) : null;
      
      if (!currentUserData) {
        toast.error('You must be logged in to reset passwords');
        return;
      }
      
      // Check if user has permission to reset this password
      const canResetPassword = 
        currentUserData.role?.toLowerCase() === 'admin' || 
        (currentUserData.role?.toLowerCase() === 'manager' && 
         selectedUser.role.toLowerCase() === 'user' && 
         selectedUser.facility === currentUserData.facility);
      
      if (!canResetPassword) {
        toast.error('You do not have permission to reset this user\'s password');
        return;
      }
      
      const { error } = await supabase
        .from('users_log')
        .update({ 
          password: newPassword,
          modified_by: currentUserData.username || 'system',
          modified_at: new Date().toISOString()
        })
        .eq('user_id', selectedUser.id);
      
      if (error) {
        throw error;
      }
      
      toast.success(`Password reset for ${selectedUser.username}`);
      setIsResetPasswordOpen(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    try {
      // Get current user for permission check
      const userStr = localStorage.getItem('user');
      const currentUserData = userStr ? JSON.parse(userStr) : null;
      
      if (!currentUserData) {
        toast.error('You must be logged in to delete users');
        return;
      }
      
      // Check if user has permission to delete this user
      const canDeleteUser = 
        currentUserData.role?.toLowerCase() === 'admin' || 
        (currentUserData.role?.toLowerCase() === 'manager' && 
         user.role.toLowerCase() === 'user' && 
         user.facility === currentUserData.facility);
      
      if (!canDeleteUser) {
        toast.error('You do not have permission to delete this user');
        return;
      }
      
      const { error } = await supabase
        .from('users_log')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setUsers(users.filter(u => u.id !== user.id));
      toast.success(`User ${user.username} deleted`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Only show the user management UI if user has permission
  if (!hasPermission) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">Access Restricted</h2>
        <p className="text-yellow-700">
          You do not have permission to manage users. 
          Only Admins and Managers can access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <AddUserDialog 
          facilities={facilities}
          onAddUser={handleAddUser}
          isLoading={isLoading}
        />
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found. Add your first user using the "Add User" button.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <UserTableRow 
                  key={user.id}
                  user={user}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <ResetPasswordDialog
        isOpen={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        selectedUser={selectedUser}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
};

export default UserManagementTable;
