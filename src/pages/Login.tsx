
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if any admin user exists
    const checkAdminExists = async () => {
      try {
        setIsCheckingAdmin(true);
        
        // First check if the table exists
        const { count, error: tableError } = await supabase
          .from('users_log')
          .select('*', { count: 'exact', head: true });
        
        if (tableError) {
          console.error('Error checking users_log table:', tableError);
          setAdminExists(false);
          return;
        }
        
        // Check for admin users
        const { data, error } = await supabase
          .from('users_log')
          .select('user_id')
          .eq('role', 'Admin');
        
        if (error) throw error;
        
        setAdminExists(data && data.length > 0);
      } catch (error) {
        console.error('Error checking for admin users:', error);
        // If we can't check, assume admin exists to be safe
        setAdminExists(true);
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    checkAdminExists();
  }, []);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!username || !password) {
    toast.error('Please enter both username and password');
    return;
  }
  
  setIsLoading(true);
  
  try {
    // Sign in with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username, // Assuming username is email
      password: password
    });
    
    if (authError) throw authError;
    
    // Then get user details from your custom table
    const { data, error } = await supabase
      .from('users_log')
      .select('user_id, username, role, status')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    
    if (data.status !== 'active') {
      throw new Error('Your account is inactive. Please contact an administrator.');
    }
    
    // Store user info in localStorage
    const userData = {
      id: data.user_id,
      username: data.username,
      role: data.role,
      facility: 'All'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Rest of your code...
  } catch (error) {
    // Error handling...
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Warehouse Management System</CardTitle>
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
              
              {!isCheckingAdmin && !adminExists && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-center">
                  <p className="text-sm text-blue-700 mb-2">
                    No admin user found. Create the first admin user to get started:
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/create-admin')}
                  >
                    Create Admin User
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
