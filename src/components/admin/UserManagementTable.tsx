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
    // Check if user is logged in and has admin privileges
    const checkPermission = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.log('No user found in localStorage');
          setHasPermission(false);
          return null;
        }
        
        const user = JSON.parse(userStr);
        console.log('Current user from localStorage:', user);
        setCurrentUser(user);
        
        // Check if user has admin role - case insensitive or exact match with "Admin"
        const isAdmin = 
          user.isAdmin === true || 
          (user.role && user.role.toLowerCase() === 'admin') ||
          (user.role && user.role === 'Admin');
        
        console.log('Is admin check result:', isAdmin);
        
        if (!isAdmin) {
          console.log('User does not have admin role:', user);
          setHasPermission(false);
          toast.error('You must be an admin to manage users');
        } else {
          setHasPermission(true);
          console.log('User has admin privileges, proceeding...');
        }
        
        return user;
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermission(false);
        return null;
      }
    };
    
    const user = checkPermission();
    if (user && hasPermission) {
      fetchFacilities();
      fetchUsers();
    }
  }, []);

  const fetchFacilities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('facility_master')
        .select('name');
      
      if (error) {
        throw error;
      }
      
      // Extract facility names from the data
      const facilityNames = data.map(facility => facility.name);
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
      
      if (!currentUser) {
        setHasPermission(false);
        return;
      }

      console.log('Fetching users with current user:', currentUser);
      
      const { data, error } = await supabase
        .from('users_log')
        .select('user_id, username, role, facility, last_login');
      
      if (error) {
        console.error('Error details:', error);
        if (error.message.includes('row-level security') || error.message.includes('permission denied')) {
          setHasPermission(false);
          toast.error('You do not have permission to view users');
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
      if (!currentUser) {
        toast.error('You must be logged in to add users');
        return;
      }
      
      // Double-check admin privileges before adding user
      const isAdmin = 
        currentUser.isAdmin === true || 
        (currentUser.role && currentUser.role.toLowerCase() === 'admin') ||
        (currentUser.role && currentUser.role === 'Admin');
        
      if (!isAdmin) {
        toast.error('Only administrators can add new users');
        return;
      }
      
      console.log('Adding user with data:', {...userData, password: '[REDACTED]'});
      
      // Generate a new UUID for the user_id
      const newUserId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('users_log')
        .insert({
          user_id: newUserId,
          username: userData.username,
          password: userData.password, // In production, this should be hashed
          role: userData.role,
          facility: userData.facility,
          status: 'active',
          created_by: currentUser.username,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        if (error.message.includes('row-level security') || error.message.includes('permission denied')) {
          toast.error('You do not have permission to add users. Only admins can add new users.');
          return;
        }
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
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    try {
      if (!selectedUser) {
        toast.error('No user selected');
        return;
      }
      
      // Double-check admin privileges
      const isAdmin = 
        currentUser?.isAdmin === true || 
        (currentUser?.role && currentUser.role.toLowerCase() === 'admin') ||
        (currentUser?.role && currentUser.role === 'Admin');
        
      if (!isAdmin) {
        toast.error('Only administrators can reset passwords');
        return;
      }
      
      const { error } = await supabase
        .from('users_log')
        .update({ 
          password: newPassword,
          modified_by: currentUser?.username,
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
      // Double-check admin privileges
      const isAdmin = 
        currentUser?.isAdmin === true || 
        (currentUser?.role && currentUser.role.toLowerCase() === 'admin') ||
        (currentUser?.role && currentUser.role === 'Admin');
        
      if (!isAdmin) {
        toast.error('Only administrators can delete users');
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

  // If user doesn't have permission, show access denied message
  if (!hasPermission) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            You don't have permission to manage users. Please log in with an administrator account.
          </AlertDescription>
        </Alert>
        <p className="text-center text-gray-500 mt-4">
          If you believe this is an error, please contact your system administrator.
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