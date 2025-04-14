
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, Warehouse } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Warehouse className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">WMS</h1>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">{user.username}</span>
              {user.facility && (
                <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                  {user.facility}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
