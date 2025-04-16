
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const CreateAdminUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Check if users_log table exists
      const { count, error: checkError } = await supabase
        .from('users_log')
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        toast.error('Error checking users table. Database might not be set up correctly.');
        throw checkError;
      }
      
      // Check if there are any existing admin users
      const { data: existingAdmins, error: adminCheckError } = await supabase
        .from('users_log')
        .select('user_id')
        .eq('role', 'Admin');
      
      if (adminCheckError) {
        throw adminCheckError;
      }
      
      if (existingAdmins && existingAdmins.length > 0) {
        toast.error('An admin user already exists. Please use the regular login.');
        navigate('/');
        return;
      }
      
      // Try RPC function first since it's the safer method
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'create_admin_user',
        {
          admin_username: username,
          admin_password: password
        }
      );
      
      if (rpcError) {
        console.error('RPC error:', rpcError);
        
        // Fallback to direct insert if RPC fails
        const { data: insertData, error: insertError } = await supabase
          .from('users_log')
          .insert({
            username,
            password,
            role: 'Admin',
            facility: 'All',
            status: 'active'
          })
          .select();
          
        if (insertError) {
          throw insertError;
        }
      } else {
        // Check RPC result - Fix type error by checking properties safely
        if (rpcData && typeof rpcData === 'object' && 'success' in rpcData) {
          const result = rpcData as { success: boolean, message?: string };
          if (!result.success) {
            const message = result.message || 'Failed to create admin user';
            toast.error(message);
            return;
          }
        }
      }
      
      toast.success('Admin user created successfully! You can now login.');
      navigate('/');
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Admin User</CardTitle>
          <CardDescription>
            Set up the first administrator account for the warehouse management system.
            This screen will only work if no admin user exists yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={isCreating}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button onClick={handleCreateAdmin} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Admin User'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAdminUser;
