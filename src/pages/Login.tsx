
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Successful login
      const user = data.user;
      
      toast.success(`Welcome back, ${user.email}!`);
      
      // Get user role from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, username, facility')
        .eq('email', user.email)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        // Default to user role if we can't fetch the specific role
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || 'user',
          role: 'user',
          facility: 'Unknown'
        }));
        
        navigate('/inbound');
        return;
      }
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        username: userData.username || user.email?.split('@')[0] || 'user',
        role: userData.role || 'user',
        facility: userData.facility || 'Unknown'
      }));
      
      // Redirect to appropriate page based on role
      if (userData.role === 'admin') {
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

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password to sign up');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // Create entry in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          email: email,
          username: email.split('@')[0],
          role: 'user',
          facility: 'Default Facility',
          password: 'stored-in-auth' // We don't store actual passwords, auth handles that
        });
      
      if (userError) {
        console.error('Error creating user record:', userError);
      }
      
      toast.success('Sign up successful! Please check your email for verification.');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Sign up failed. Please try again.');
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
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2" 
                onClick={handleSignUp}
                disabled={isLoading}
              >
                Create Account
              </Button>
              
              <div className="mt-4 text-center text-sm">
                <p className="text-gray-500">
                  Test Account:
                </p>
                <p>
                  Email: <span className="font-bold">admin@example.com</span> | 
                  Password: <span className="font-bold">admin123</span>
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
