export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<User | null>;
  // Admin utilities (optional, only available if user.role === 'ADMIN')
  listUsers?: () => Promise<User[]>;
  createUser?: (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<User>;
  updateUser?: (id: string, payload: Partial<Omit<User, 'id'>>) => Promise<User>;
  deleteUser?: (id: string) => Promise<void>;
}
