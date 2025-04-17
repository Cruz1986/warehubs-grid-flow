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
    
    // Check if user is already logged in
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        // Redirect to appropriate page based on role
        if (user.role?.toLowerCase() === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/inbound');
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if the user exists in the users_log table
      const { data, error } = await supabase
        .from('users_log')
        .select('user_id, username, role, status, password, facility')
        .eq('username', username)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('User not found. Please check your username.');
        }
        throw error;
      }
      
      if (data.status !== 'active') {
        throw new Error('Your account is inactive. Please contact an administrator.');
      }
      
      // For this example, we'll use a simple password check
      // In a real application, you would use bcrypt or similar for password verification
      if (data.password !== password) {
        throw new Error('Incorrect password.');
      }
      
      // Prepare user data to store in localStorage
      const userData = {
        id: data.user_id,
        username: data.username,
        role: data.role,
        facility: data.facility || (data.role.toLowerCase() === 'admin' ? 'All' : 'Unknown'),
      };
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update last login time - improved with more stable approach
      try {
        const currentTime = new Date().toISOString();
        console.log('Updating last login time for user:', data.user_id, 'to', currentTime);
        
        const { error: updateError } = await supabase
          .from('users_log')
          .update({ last_login: currentTime })
          .eq('user_id', data.user_id);
        
        if (updateError) {
          console.error('Error updating last login time:', updateError);
          
          // Try an alternative update if the first one fails
          const { error: alternativeUpdateError } = await supabase.rpc(
            'update_last_login',
            { user_id: data.user_id, login_time: currentTime }
          ).catch(e => {
            console.log('RPC update_last_login not available:', e);
            return { error: e };
          });
          
          if (alternativeUpdateError) {
            console.error('Alternative update failed too:', alternativeUpdateError);
          } else {
            console.log('Alternative update succeeded');
          }
        } else {
          console.log('Successfully updated last login time');
        }
      } catch (updateError) {
        console.error('Exception in last login update:', updateError);
        // Don't fail the login if only the timestamp update fails
      }
      
      toast.success(`Welcome back, ${data.username}!`);
      
      // Redirect to appropriate page based on role
      if (data.role.toLowerCase() === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/inbound');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
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