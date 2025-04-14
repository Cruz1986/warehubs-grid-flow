
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from 'lucide-react';

interface User {
  id: string;
  username: string;
  role: string;
  facility: string;
  lastLogin?: string;
}

interface UserTableRowProps {
  user: User;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, onEditUser, onDeleteUser }) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.username}</TableCell>
      <TableCell>{user.role}</TableCell>
      <TableCell>{user.facility}</TableCell>
      <TableCell>{user.lastLogin || 'Never'}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditUser(user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteUser(user)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
