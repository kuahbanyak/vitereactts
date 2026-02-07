
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  avatar?: string;
  roles?: Role[];
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export function getPrimaryRole(user: User): string {
  if (user.roles && user.roles.length > 0) {
    return user.roles[0].display_name || user.roles[0].name;
  }
  return user.role || 'customer';
}
export function hasRole(user: User, roleName: string): boolean {
  if (user.roles && user.roles.length > 0) {
    return user.roles.some(r => r.name.toLowerCase() === roleName.toLowerCase());
  }
  return user.role?.toLowerCase() === roleName.toLowerCase();
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<User | null>;
}
