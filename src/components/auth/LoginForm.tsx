]import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if navigation is available (helps with debugging)
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear any existing session on component mount
    localStorage.removeItem('user');
    console.log("LoginForm mounted, navigation available:", !!navigate);
  }, [navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log("Login attempt with:", { username, password: "***" });
      
      if (!username || !password) {
        setError("Please enter both username and password");
        toast.error("Please enter both username and password");
        return;
      }
      
      // For testing - any username with admin in it becomes an admin user
      const isAdmin = username.toLowerCase().includes('admin');
      
      // Store user info
      const userData = {
        username,
        isAdmin,
        facility: isAdmin ? 'All' : 'Facility A',
        loginTime: new Date().toISOString()
      };
      
      console.log("User authenticated:", userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success("Login successful!");
      console.log("Redirecting to:", isAdmin ? '/admin-dashboard' : '/inbound');
      
      // Add a slight delay to ensure toast is visible before redirect
      setTimeout(() => {
        if (navigate) {
          navigate(isAdmin ? '/admin-dashboard' : '/inbound');
        } else {
          console.error("Navigation not available. Is this component within a Router?");
          setError("Navigation error - please check console");
        }
      }, 500);
      
    } catch (error) {
      console.error("Login error:", error);
      setError(`Login failed: ${error.message || "Unknown error"}`);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Warehouse Management System</CardTitle>
        <CardDescription>Enter your credentials to access the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">Username</label>
            <Input 
              id="username" 
              type="text" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">WMS v1.0</p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;