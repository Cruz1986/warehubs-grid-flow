
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
      // Use the RPC function rather than direct insert
      const { data, error } = await supabase.rpc('create_admin_user', {
        admin_username: username,
        admin_password: password
      });
      
      if (error) {
        throw error;
      }
      
      // Check the response from the function
      if (data && data.success) {
        toast.success('Admin user created successfully! You can now login.');
        navigate('/');
      } else {
        toast.error(data?.message || 'Failed to create admin user. An admin may already exist.');
        if (data?.message?.includes('admin user already exists')) {
          navigate('/');
        }
      }
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
