// Role type matching the backend Role entity
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
  // Roles is an array from the backend (many-to-many relationship)
  roles?: Role[];
  // Legacy single role field for backward compatibility
  role?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper to get the primary role name from user
export function getPrimaryRole(user: User): string {
  if (user.roles && user.roles.length > 0) {
    return user.roles[0].display_name || user.roles[0].name;
  }
  return user.role || 'customer';
}

// Helper to check if user has a specific role
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
