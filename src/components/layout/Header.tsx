
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const handleHome = () => {
    navigate('/');
  };
  
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6">
      <div className="flex-1 flex items-center">
        {children}
        <div className="md:hidden ml-2 text-lg font-semibold">Warehouse Hub</div>
      </div>
      
      <div className="flex items-center gap-4">
        <Badge variant={isAdmin ? "destructive" : "secondary"}>
          {isAdmin ? 'Admin Access' : 'User Access'}
        </Badge>
        <Button variant="ghost" size="icon" onClick={handleHome}>
          <Home className="h-5 w-5" />
          <span className="sr-only">Home</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
