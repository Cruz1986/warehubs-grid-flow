
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import AddUserDialog from "./user-management/AddUserDialog";
import UserTableRow from "./user-management/UserTableRow";
import ResetPasswordDialog from "./user-management/ResetPasswordDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  username: string;
  role: string;
  status: string;
  lastLogin: string | null;
  facilityName?: string;
}

export const UserManagementTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [facilities, setFacilities] = useState<string[]>([]);

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('facility_master')
        .select("name");

      if (error) {
        console.error("Error loading facilities:", error);
        return [];
      }

      if (data) {
        return data.map((facility) => facility.name);
      }

      return [];
    } catch (error) {
      console.error("Exception loading facilities:", error);
      return [];
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*");

      if (error) {
        throw error;
      }

      if (data) {
        const formattedUsers = data.map((user) => ({
          id: user.user_id,
          username: user.username,
          role: user.role,
          status: user.status,
          lastLogin: user.last_login,
        }));
        setUsers(formattedUsers);
      }

      const facilityList = await fetchFacilities();
      setFacilities(facilityList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel("user-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        fetchUsers
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetPasswordDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddUserDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableHead
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading users...
                </TableHead>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableHead
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found. Add your first user to get started.
                </TableHead>
              </TableRow>
            ) : (
              users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onResetPassword={() => handleResetPassword(user)}
                  onUserUpdated={fetchUsers}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddUserDialog
        open={showAddUserDialog}
        onOpenChange={setShowAddUserDialog}
        onUserAdded={fetchUsers}
        facilities={facilities}
      />

      {selectedUser && (
        <ResetPasswordDialog
          open={showResetPasswordDialog}
          onOpenChange={setShowResetPasswordDialog}
          user={selectedUser}
          onPasswordReset={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserManagementTable;
