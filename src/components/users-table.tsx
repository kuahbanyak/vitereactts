import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconEdit, IconTrash, IconLoader2 } from '@tabler/icons-react';
import { RoleBadge } from './role-badge';
import { DeleteConfirmationModal } from './delete-confirmation-modal';
import type { User } from '@/types/user.types';

interface UsersTableProps {
  users: User[];
  currentUserId?: string;
  actionLoading?: string | null;
  onEdit: (user: User) => void;
  onDelete: (userId: string, userName: string) => void;
}

export function UsersTable({
  users,
  currentUserId,
  actionLoading,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string | null;
  }>({
    isOpen: false,
    userId: null,
    userName: null,
  });

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.userId && deleteModal.userName) {
      onDelete(deleteModal.userId, deleteModal.userName);
      setDeleteModal({ isOpen: false, userId: null, userName: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: null });
  };
  return (
    <div className="w-full overflow-x-auto">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Phone</TableHead>
              <TableHead className="min-w-[100px]">Role</TableHead>
              <TableHead className="text-right min-w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="transition-colors duration-200 hover:bg-accent/50"
              >
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="break-all">{user.email}</TableCell>
                <TableCell>{user.phone || 'N/A'}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(user)}
                      disabled={actionLoading === user.id}
                      className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <IconEdit className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(user.id, user.name)}
                      disabled={
                        actionLoading === user.id ||
                        user.id === currentUserId
                      }
                      className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {actionLoading === user.id ? (
                        <IconLoader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <IconTrash className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline ml-1">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <DeleteConfirmationModal
      isOpen={deleteModal.isOpen}
      onClose={handleDeleteCancel}
      onConfirm={handleDeleteConfirm}
      itemName={deleteModal.userName || undefined}
      isLoading={actionLoading === deleteModal.userId}
      title="Delete User"
      description={`Are you sure you want to delete user "${deleteModal.userName}"? This action cannot be undone.`}
    />
  </div>
  );
}

