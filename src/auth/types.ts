export interface User {
  id: string;
  email: string;
  name?: string;
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
}
