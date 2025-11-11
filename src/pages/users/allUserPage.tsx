import React, { useEffect, useState } from 'react';
import { useAuth } from '@/auth/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { IconUser } from '@tabler/icons-react';
import { useUserManagement, useUserForm } from './hooks';
import { PageHeader } from '@/components/page-header';
import { UsersTable } from '@/components/users-table';
import { EditUserModal } from '@/components/edit-user-modal';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { AccessDenied } from '@/components/access-denied';
import type { UpdateUserPayload, User } from '@/types/user.types';

export default function AllUserPage() {
  const { user: currentUser } = useAuth();
  const { users, loading, actionLoading, fetchUsers, updateUser, deleteUser } = useUserManagement();
  const { formData, initializeForm, updateFormData, resetForm } = useUserForm();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Load users on mount
  useEffect(() => {
    if (currentUser?.role?.toLowerCase() === 'admin') {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // Handle edit user
  const handleEdit = (user: typeof users[0]) => {
    initializeForm(user);
    setEditingUser(user.id);
    setShowEditModal(true);
  };

  // Handle update user
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const payload: UpdateUserPayload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      role: formData.role,
    };

    await updateUser(editingUser, payload);
    handleCloseModal();
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    resetForm();
  };

  // Check if user is admin
  if (currentUser?.role?.toLowerCase() !== 'admin') {
    return (
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="User Management" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <AccessDenied />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const currentEditingUser = users.find((u: User) => u.id === editingUser);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="User Management" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <PageHeader
                  description="Manage all users in the system"
                  loading={loading}
                  onRefresh={fetchUsers}
                />
              </div>

              {/* Users Table Card */}
              <div className="px-4 lg:px-6">
                <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconUser className="w-5 h-5" />
                      All Users
                    </CardTitle>
                    <CardDescription>
                      Total users: {users.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoadingState loading={loading} />
                    {!loading && users.length === 0 && (
                      <EmptyState
                        icon={<IconUser className="w-full h-full" />}
                        title="No users found"
                      />
                    )}
                    {!loading && users.length > 0 && (
                      <UsersTable
                        users={users}
                        currentUserId={currentUser?.id}
                        actionLoading={actionLoading}
                        onEdit={handleEdit}
                        onDelete={deleteUser}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        {showEditModal && currentEditingUser && (
          <EditUserModal
            user={currentEditingUser}
            formData={formData}
            isLoading={actionLoading === editingUser}
            onClose={handleCloseModal}
            onSubmit={handleUpdate}
            onFormChange={updateFormData}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
