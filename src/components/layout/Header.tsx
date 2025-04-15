
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useUser } from '@/context/UserContext';
import { toast } from "sonner";

const Header: React.FC<{children?: React.ReactNode}> = ({ children }) => {
  const { user, logout } = useUser();
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4">
        {children}
        <h1 className="font-bold">Warehouse Management System</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">{user.username}</span>
              {user.role && (
                <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                  {user.role}
                </span>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export { Header };

// Export the UserProvider and useUser hook for backwards compatibility
export { UserProvider, useUser } from '@/context/UserContext';
export default Header;
