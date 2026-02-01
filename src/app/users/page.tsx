import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/auth/use-auth';
import { userService } from '@/pages/users/userService';
import type { User, UpdateUserPayload, Role } from '@/types/user.types';
import { hasRole } from '@/auth/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { RoleBadge } from '@/components/role-badge';
import { ROLE_NAMES } from '@/config/env.config';

interface FormState {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
}

const emptyForm: FormState = { name: '', email: '', phone: '', password: '', role: ROLE_NAMES.CUSTOMER };

// Available roles matching backend configuration
const AVAILABLE_ROLES: Role[] = [
  {
    id: '1',
    name: ROLE_NAMES.ADMIN,
    display_name: 'Administrator',
    description: 'Full system access and management capabilities',
    is_active: true
  },
  {
    id: '2',
    name: ROLE_NAMES.MANAGER,
    display_name: 'Manager',
    description: 'Can manage operations and view reports',
    is_active: true
  },
  {
    id: '3',
    name: ROLE_NAMES.MECHANIC,
    display_name: 'Mechanic',
    description: 'Can perform maintenance tasks and update service status',
    is_active: true
  },
  {
    id: '4',
    name: ROLE_NAMES.CUSTOMER,
    display_name: 'Customer',
    description: 'Basic user with access to customer features',
    is_active: true
  }
];

export default function UsersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const canManage = user ? hasRole(user, ROLE_NAMES.ADMIN) : false;

  const load = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      setItems(data);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => { load(); }, [load]);

  const onEdit = (u: User) => {
    const roleName = u.roles && u.roles.length > 0 ? u.roles[0].name : (u.role || 'user');
    setForm({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', role: roleName });
    setShowForm(true);
  };

  const onDelete = async (u: User) => {
    if (!confirm(`Delete user ${u.email}?`)) return;
    try {
      await userService.deleteUser(u.id, u.name || u.email);
      setItems(prev => prev.filter(x => x.id !== u.id));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Delete failed';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        const payload: UpdateUserPayload = { name: form.name, email: form.email, phone: form.phone, role: form.role };
        if (form.password) payload.password = form.password;
        const updated = await userService.update(form.id, payload);
        if (updated) {
          setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
        }
      } else {
        const created = await userService.create({ name: form.name, email: form.email, password: form.password || 'ChangeMe123!', phone: form.phone, role: form.role });
        setItems(prev => [created, ...prev]);
      }
      resetForm();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Save failed';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return <div className="p-6">Not authorized.</div>;
  }

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Users" />
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button onClick={() => { setShowForm(v => !v); if (!showForm) setForm(emptyForm); }}>
              {showForm ? 'Close Form' : 'Add User'}
            </Button>
            <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</Button>
          </div>
          {showForm && (
            <form onSubmit={submit} className="grid gap-4 max-w-xl p-4 border rounded-md bg-background">
              {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
              <div className="grid gap-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required disabled={!!form.id} />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  {AVAILABLE_ROLES.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.display_name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password">Password {form.id && <span className="text-xs text-muted-foreground">(leave blank to keep)</span>}</Label>
                <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={form.id ? '••••••••' : ''} required={!form.id} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : form.id ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          )}
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Role</th>
                  <th className="p-2 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.phone || ''}</td>
                    <td className="p-2">
                      {u.roles && u.roles.length > 0 ? (
                        <RoleBadge roles={u.roles} />
                      ) : (
                        <RoleBadge role={u.role || 'user'} />
                      )}
                    </td>
                    <td className="p-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(u)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(u)}>Delete</Button>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No users</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">Loading...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
