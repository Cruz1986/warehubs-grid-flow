
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash, UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Mock data - would be replaced with Google Sheet data
const mockFacilities = ['Facility A', 'Facility B', 'Facility C', 'Facility D'];

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
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'User',
    facility: '',
  });
  
  // Reset password form state
  const [resetPassword, setResetPassword] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleAddUser = () => {
    // Validate form
    if (!newUser.username || !newUser.password || !newUser.facility) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Add user (in production, this would call your Google Script API)
    const newId = (users.length + 1).toString();
    setUsers([...users, { 
      id: newId, 
      username: newUser.username, 
      role: newUser.role, 
      facility: newUser.facility 
    }]);
    
    // Reset form and close dialog
    setNewUser({
      username: '',
      password: '',
      role: 'User',
      facility: '',
    });
    setIsAddUserOpen(false);
    toast.success("User added successfully");
  };

  const handleResetPassword = () => {
    // Validate passwords
    if (resetPassword.password !== resetPassword.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!resetPassword.password) {
      toast.error("Password cannot be empty");
      return;
    }
    
    // In production, this would call your Google Script API to reset the password
    toast.success(`Password reset for ${selectedUser?.username}`);
    setIsResetPasswordOpen(false);
    setResetPassword({
      password: '',
      confirmPassword: '',
    });
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
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for the warehouse management system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="facility">Facility</Label>
                <Select
                  value={newUser.facility}
                  onValueChange={(value) => setNewUser({...newUser, facility: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {newUser.role === 'Admin' && (
                      <SelectItem value="All">All Facilities</SelectItem>
                    )}
                    {mockFacilities.map((facility) => (
                      <SelectItem key={facility} value={facility}>
                        {facility}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.facility}</TableCell>
                <TableCell>{user.lastLogin || 'Never'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsResetPasswordOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={resetPassword.password}
                onChange={(e) => setResetPassword({...resetPassword, password: e.target.value})}
                placeholder="Enter new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={resetPassword.confirmPassword}
                onChange={(e) => setResetPassword({...resetPassword, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementTable;
