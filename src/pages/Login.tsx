
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { setIsAdmin } = useAuth();

  const handleUserAccess = () => {
    setIsAdmin(false);
    navigate('/inbound');
  };

  const handleAdminAccess = () => {
    setIsAdmin(true);
    navigate('/admin-dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Warehouse Management System</CardTitle>
            <CardDescription>Select your access level to enter the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleUserAccess}
                className="w-full"
              >
                Enter as User
              </Button>
              <Button 
                onClick={handleAdminAccess}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Enter as Admin
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">WMS v1.0</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
