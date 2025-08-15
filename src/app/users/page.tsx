import React, { useEffect, useState } from 'react';
import { useAuth } from '@/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';

interface FormState {
  id?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
}

const emptyForm: FormState = { name: '', email: '', phone: '', password: '', role: 'USER' };

export default function UsersPage() {
  const { user, listUsers, createUser, updateUser, deleteUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const canManage = user?.role === 'ADMIN' && listUsers && createUser && updateUser && deleteUser;

  const load = async () => {
    if (!canManage) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers();
      setItems(data);
    } catch (e:any) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [canManage]);

  const onEdit = (u: any) => {
    setForm({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', role: u.role || 'USER' });
    setShowForm(true);
  };

  const onDelete = async (u: any) => {
    if (!deleteUser) return;
    if (!confirm(`Delete user ${u.email}?`)) return;
    try {
      await deleteUser(u.id);
      setItems(prev => prev.filter(x => x.id !== u.id));
    } catch (e:any) {
      alert(e.message || 'Delete failed');
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
        const payload: any = { name: form.name, email: form.email, phone: form.phone, role: form.role };
        if (form.password) payload.password = form.password;
        const updated = await updateUser!(form.id, payload);
        setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      } else {
        const created = await createUser!({ name: form.name, email: form.email, password: form.password || 'ChangeMe123!', phone: form.phone, role: form.role });
        setItems(prev => [created, ...prev]);
      }
      resetForm();
    } catch (e:any) {
      setError(e.message || 'Save failed');
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
                <select id="role" className="h-9 rounded-md border bg-background px-3 text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
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
                    <td className="p-2">{u.role}</td>
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

