
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
  
  useEffect(() => {
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

    fetchFacilities();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('users_log')
        .select('user_id, username, role, facility, last_login');
      
      if (error) {
        throw error;
      }
      
      // Map the data to our User interface format
      const mappedUsers = data.map((user) => ({
        id: user.user_id,
        username: user.username,
        role: user.role,
        facility: user.facility || 'Unknown',
        lastLogin: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'
      }));
      
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
      // Get the current logged in user to use as the creator
      const currentUserStr = localStorage.getItem('user');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      
      if (!currentUser) {
        toast.error('You must be logged in to add users');
        return;
      }
      
      // In a real application, this would call your API to add the user
      const { data, error } = await supabase
        .from('users_log')
        .insert({
          username: userData.username,
          password: userData.password,
          role: userData.role,
          facility: userData.facility,
          status: 'active'
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
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    try {
      if (!selectedUser) {
        toast.error('No user selected');
        return;
      }
      
      const { error } = await supabase
        .from('users_log')
        .update({ password: newPassword })
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
