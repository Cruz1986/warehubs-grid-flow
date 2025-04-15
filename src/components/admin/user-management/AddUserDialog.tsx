
import React, { useEffect } from 'react';
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
import { UserPlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddUserDialogProps {
  facilities: string[];
  onAddUser: (user: {
    username: string;
    password: string;
    role: string;
    facility: string;
  }) => void;
  isLoading?: boolean;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ facilities, onAddUser, isLoading = false }) => {
  const [open, setOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    username: '',
    password: '',
    role: 'User',
    facility: '',
  });

  const handleAddUser = () => {
    // Validate form
    if (!newUser.username || !newUser.password || !newUser.facility) {
      toast.error("Please fill all required fields");
      return;
    }
    
    onAddUser(newUser);
    
    // Reset form and close dialog
    setNewUser({
      username: '',
      password: '',
      role: 'User',
      facility: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading facilities..." : "Select facility"} />
              </SelectTrigger>
              <SelectContent>
                {newUser.role === 'Admin' && (
                  <SelectItem value="All">All Facilities</SelectItem>
                )}
                {facilities.length > 0 ? (
                  facilities.map((facility) => (
                    <SelectItem key={facility} value={facility}>
                      {facility}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-facilities" disabled>
                    {isLoading ? "Loading facilities..." : "No facilities available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {isLoading && (
              <p className="text-xs text-muted-foreground">Loading facilities from database...</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddUser}>
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
