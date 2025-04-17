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

interface AddUserResponse {
  user_id: string;
  username: string;
  role: string;
  facility: string;
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
    const userStr = localStorage.getItem('user');
    console.log('Raw user string from localStorage:', userStr);

    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('Parsed user object:', user);
      setCurrentUser(user);

      const isAdmin = user.role?.toLowerCase() === 'admin';
      const isManager = user.role?.toLowerCase() === 'manager';

      setHasPermission(isAdmin || isManager);
    } else {
      console.log('No user found in localStorage');
      setHasPermission(false);
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    setHasPermission(false);
  }
}, []);

useEffect(() => {
  if (currentUser && hasPermission) {
    fetchFacilities();
    fetchUsers();
  }
}, [currentUser, hasPermission]);

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

    let query = supabase
      .from('users_log')
      .select('user_id, username, role, facility, last_login');

    if (currentUser?.role?.toLowerCase() === 'manager' && currentUser.facility && currentUser.facility !== 'All') {
      query = query.eq('facility', currentUser.facility);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

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
    setIsLoading(true);
    
    console.log("Adding user with data:", {
      ...userData,
      password: "[REDACTED]" // Don't log actual password
    });
    
    const { data, error } = await supabase.rpc(
      'add_user',
      {
        p_username: userData.username,
        p_password: userData.password,
        p_role: userData.role,
        p_facility: userData.facility
      }
    );
    
    if (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user: ' + error.message);
      
      if (error.message.includes('function "add_user" does not exist')) {
        toast.warning('RPC function not found, attempting direct insert (may fail due to RLS)');
        
        const newUserId = crypto.randomUUID();
        
        const { data: insertData, error: insertError } = await supabase
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
        
        if (insertError) {
          console.error('Direct insert error:', insertError);
          toast.error('Failed to add user: ' + insertError.message);
          return;
        }
        
        if (insertData && insertData[0]) {
          const newUser: User = {
            id: insertData[0].user_id,
            username: insertData[0].username,
            role: insertData[0].role,
            facility: insertData[0].facility || 'Unknown',
            lastLogin: 'Never'
          };
          
          setUsers([...users, newUser]);
          toast.success("User added successfully");
          return;
        }
        
        return;
      }
      
      return;
    }

    console.log("User created successfully, data returned:", data);

    if (data && typeof data === 'object') {
      const responseData = data as AddUserResponse;
      
      const newUser: User = {
        id: responseData.user_id,
        username: responseData.username,
        role: responseData.role,
        facility: responseData.facility || 'Unknown',
        lastLogin: 'Never'
      };
      
      setUsers([...users, newUser]);
      toast.success("User added successfully");
    } else {
      console.error("No data returned from add_user RPC");
      toast.error("User may have been created but no data was returned");
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
    
    console.log(`Resetting password for user ${selectedUser.id} (${selectedUser.username})`);
    console.log(`New password length: ${newPassword.length}`);
    
    const { data, error } = await supabase.rpc(
      'reset_user_password',
      {
        p_user_id: selectedUser.id,
        p_new_password: newPassword
      }
    );
    
    console.log("Reset password result:", { data, error });
    
    if (error) {
      if (error.message.includes('function "reset_user_password" does not exist')) {
        console.log("Falling back to direct update for password reset");
        const { error: updateError } = await supabase
          .from('users_log')
          .update({ 
            password: newPassword,
            modified_at: new Date().toISOString()
          })
          .eq('user_id', selectedUser.id);
        
        if (updateError) {
          console.error("Direct update failed:", updateError);
          throw updateError;
        } else {
          console.log("Direct update succeeded");
        }
      } else {
        console.error("RPC error:", error);
        throw error;
      }
    } else {
      console.log("RPC reset_user_password succeeded");
    }
    
    toast.success(`Password reset for ${selectedUser.username}`);
    setIsResetPasswordOpen(false);
  } catch (error: any) {
    console.error('Error resetting password:', error);
    toast.error('Failed to reset password: ' + error.message);
  }
};

const handleEditUser = (user: User) => {
  console.log("Edit user selected:", user);
  setSelectedUser(user);
  setIsResetPasswordOpen(true);
};

const handleDeleteUser = async (user: User) => {
  try {
    console.log(`Attempting to delete user ${user.id} (${user.username})`);
    
    const { data, error } = await supabase.rpc(
      'delete_user',
      { p_user_id: user.id }
    );
    
    console.log("Delete user result:", { data, error });
    
    if (error) {
      if (error.message.includes('function "delete_user" does not exist')) {
        console.log("Falling back to direct delete");
        const { error: deleteError } = await supabase
          .from('users_log')
          .delete()
          .eq('user_id', user.id);
        
        if (deleteError) {
          console.error("Direct delete failed:", deleteError);
          throw deleteError;
        } else {
          console.log("Direct delete succeeded");
        }
      } else {
        console.error("RPC error:", error);
        throw error;
      }
    } else {
      console.log("RPC delete_user succeeded");
    }
    
    setUsers(users.filter(u => u.id !== user.id));
    toast.success(`User ${user.username} deleted`);
  } catch (error: any) {
    console.error('Error deleting user:', error);
    toast.error('Failed to delete user: ' + error.message);
  }
};

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
