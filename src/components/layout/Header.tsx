
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Home, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/inbound');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleHome}>
            <Home className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-1 items-center justify-between md:justify-end">
          <div className="flex items-center">
            {children}
            <span className="text-xl font-bold ml-4 hidden md:block">
              Warehouse Hub Management System
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  <div className="text-sm text-muted-foreground">
                    {user.username} ({user.role}) - {user.facility}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
