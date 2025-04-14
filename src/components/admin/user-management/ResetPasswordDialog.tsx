
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  role: string;
  facility: string;
  lastLogin?: string;
}

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  onResetPassword: (password: string) => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedUser,
  onResetPassword,
}) => {
  const [resetPassword, setResetPassword] = React.useState({
    password: '',
    confirmPassword: '',
  });

  React.useEffect(() => {
    if (!isOpen) {
      setResetPassword({
        password: '',
        confirmPassword: '',
      });
    }
  }, [isOpen]);

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
    
    onResetPassword(resetPassword.password);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResetPassword}>
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
