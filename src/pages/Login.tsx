
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const onSubmit = async (data: FormData) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        throw error;
      }

      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', data.email)
        .single();

      if (userError && userError.code !== 'PGSQL_ERROR') {
        console.error("Error fetching user data:", userError);
        toast.error("Error fetching user data. Please try again.");
        return;
      }

      // If user doesn't exist in our custom users table, create one
      if (!userData) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            username: data.email,
            password: 'supabase-auth', // We don't store actual passwords anymore
            role: 'user', // Default role
            facility: 'Default Facility'
          });

        if (insertError) {
          console.error("Error creating user:", insertError);
          toast.error("Error setting up your account. Please try again.");
          return;
        }
      }

      // Set user in context with role
      setUser({
        id: authData.user?.id || '',
        email: data.email,
        role: userData?.role || 'user',
        facility: userData?.facility || 'Default Facility',
        isAuthenticated: true,
        isAdmin: userData?.role === 'admin'
      });

      toast.success('Logged in successfully');
      navigate('/inbound');
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
              
              <p className="text-sm text-center text-gray-500 mt-4">
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
