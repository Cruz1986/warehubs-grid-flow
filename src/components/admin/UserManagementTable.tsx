
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
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', role: 'Admin', facility: 'All', lastLogin: '2023-04-12 09:45' },
    { id: '2', username: 'user1', role: 'User', facility: 'Facility A', lastLogin: '2023-04-13 14:30' },
    { id: '3', username: 'user2', role: 'User', facility: 'Facility B', lastLogin: '2023-04-10 11:20' },
  ]);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('facilities')
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
  }, []);

  const handleAddUser = (newUserData: {
    username: string;
    password: string;
    role: string;
    facility: string;
  }) => {
    // Add user (in production, this would call your Google Script API)
    const newId = (users.length + 1).toString();
    setUsers([...users, { 
      id: newId, 
      username: newUserData.username, 
      role: newUserData.role, 
      facility: newUserData.facility 
    }]);
    
    toast.success("User added successfully");
  };

  const handleResetPassword = (password: string) => {
    // In production, this would call your Google Script API to reset the password
    toast.success(`Password reset for ${selectedUser?.username}`);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    // In production, this would call your Google Script API to delete the user
    setUsers(users.filter(u => u.id !== user.id));
    toast.success(`User ${user.username} deleted`);
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
            {users.map((user) => (
              <UserTableRow 
                key={user.id}
                user={user}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
              />
            ))}
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
