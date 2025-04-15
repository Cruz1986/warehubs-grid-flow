
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mock authentication since we're having issues with Google Apps Script
      const isAdmin = username.toLowerCase().includes('admin');
      const isCorrectPassword = password === 'password' || username === 'admin';
      
      if (isCorrectPassword) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify({
          username,
          isAdmin,
          role: isAdmin ? 'Admin' : 'User',
          facility: isAdmin ? 'All' : 'Facility A',
        }));
        
        // Successful login
        toast.success(`Welcome back, ${username}!`);
        
        // Redirect to appropriate page based on role
        if (isAdmin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/inbound');
        }
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="Enter your username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                <p className="text-gray-500">
                  Test Account:
                </p>
                <p>
                  Username: <span className="font-bold">admin</span> | 
                  Password: <span className="font-bold">password</span>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
