import React, { useState, useEffect } from 'react';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddUserDialogProps {
  facilities: string[];
  onAddUser: (userData: {
    username: string;
    password: string;
    role: string;
    facility: string;
  }) => void;
  isLoading: boolean;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ facilities, onAddUser, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [facility, setFacility] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user when component mounts
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        console.log("Current user in AddUserDialog:", user);
        
        // If current user is manager, set default facility to their facility
        if (user.role?.toLowerCase() === 'manager' && user.facility && user.facility !== 'All') {
          setFacility(user.facility);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Set initial facility value if facilities are loaded
  useEffect(() => {
    if (facilities.length > 0 && !facility) {
      // For admin users, default to first facility in the list
      // For managers, their facility is already set in the previous useEffect
      if (currentUser?.role?.toLowerCase() === 'admin' || !currentUser?.facility) {
        setFacility(facilities[0]);
      }
    }
  }, [facilities, facility, currentUser]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    
    if (!role) {
      newErrors.role = 'Role is required';
    }
    
    if (!facility) {
      newErrors.facility = 'Facility is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const userData = {
      username: username.trim(),
      password: password.trim(),
      role,
      facility
    };
    
    onAddUser(userData);
    
    // Reset form and close dialog
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setRole('user');
    setFacility(currentUser?.facility && currentUser.facility !== 'All' ? currentUser.facility : (facilities.length > 0 ? facilities[0] : ''));
    setErrors({});
  };

  // Allow managers to modify roles, but restrict them from creating admins
  const canCreateAdmin = currentUser?.role?.toLowerCase() === 'admin';
  
  // Check if user can modify facility (admins can choose any, managers restricted to their facility)
  const canModifyFacility = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.facility === 'All';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account for the warehouse management system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {errors.general && (
              <div className="col-span-4">
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <div className="col-span-3">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="col-span-3">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <Select 
                  value={role} 
                  onValueChange={setRole}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {canCreateAdmin && <SelectItem value="admin">Admin</SelectItem>}
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="facility" className="text-right">
                Facility
              </Label>
              <div className="col-span-3">
                <Select 
                  value={facility} 
                  onValueChange={setFacility}
                  disabled={!canModifyFacility}
                >
                  <SelectTrigger className={errors.facility ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.length === 0 ? (
                      <SelectItem value="" disabled>
                        No facilities available
                      </SelectItem>
                    ) : (
                      <>
                        {canModifyFacility && <SelectItem value="All">All Facilities</SelectItem>}
                        {facilities.map((facilityName) => (
                          <SelectItem key={facilityName} value={facilityName}>
                            {facilityName}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {!canModifyFacility && (
                  <p className="text-gray-500 text-xs mt-1">Users can only be assigned to your facility</p>
                )}
                {errors.facility && (
                  <p className="text-red-500 text-sm mt-1">{errors.facility}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;