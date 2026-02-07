import { apiClient, type ApiError } from './api-client';
import { API_ENDPOINTS } from '@/config/api.config';
import { decodeToken, getStoredToken } from '@/utils/helpers';
import type { User } from '@/auth/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
    user?: User;
  };
  message?: string;
}

export interface ProfileResponse {
  data: User;
  message?: string;
}


export const TokenManager = {

  saveToken(token: string): void {
    localStorage.setItem('token', token);
    console.log('[Auth] Token saved, length:', token.length);
  },


  getToken(): string | null {
    return getStoredToken();
  },


  removeToken(): void {
    localStorage.removeItem('token');
    console.log('[Auth] Token removed');
  },

  hasToken(): boolean {
    return !!this.getToken();
  },

  decodeToken<T = unknown>(): T | null {
    const token = this.getToken();
    if (!token) return null;
    return decodeToken<T>(token);
  },
};

export const authService = {

  async login(credentials: LoginCredentials): Promise<{ token: string; user?: User }> {
    try {
      console.log('[Auth] Logging in:', credentials.email);

      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const token = response.data?.access_token;
      if (!token) {
        throw new Error('No authentication token received from server');
      }

      TokenManager.saveToken(token);

      let user: User | undefined = response.data?.user;

      if (!user) {
        const payload = TokenManager.decodeToken<{
          user_id?: string;
          sub?: string;
          email?: string;
          name?: string;
          phone?: string;
          role?: string;
        }>();
        if (payload) {
          user = {
            id: payload.user_id || payload.sub?.toString() || '',
            email: credentials.email,
            name: payload.name || '',
            phone: payload.phone || '',
            role: payload.role || '',
          };
        }
      }

      console.log('[Auth] Login successful');
      return { token, user };
    } catch (error: unknown) {
      console.error('[Auth] Login failed:', error);

      const apiError = error as ApiError;

      if (apiError.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check your internet connection or try again later.');
      } else if (apiError.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (apiError.status === 403) {
        throw new Error('Access denied. Your account may be suspended.');
      } else if (apiError.status && apiError.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (apiError.message) {
        throw new Error(apiError.message);
      }

      throw new Error('Login failed. Please try again.');
    }
  },


  async register(data: RegisterData): Promise<{ token: string; user?: User }> {
    try {
      console.log('[Auth] Registering user:', data.email);

      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );

      const token = response.data?.access_token;
      if (!token) {
        throw new Error('No authentication token received from server');
      }

      TokenManager.saveToken(token);

      const user = response.data?.user;
      console.log('[Auth] Registration successful');

      return { token, user };
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      throw error;
    }
  },

  async getProfile(): Promise<User | null> {
    try {
      if (!TokenManager.hasToken()) {
        console.log('[Auth] No token found');
        return null;
      }

      console.log('[Auth] Fetching profile');

      const response = await apiClient.get<ProfileResponse>(API_ENDPOINTS.AUTH.PROFILE);
      const profileData = response.data;

      const user: User = {
        id: profileData.id?.toString() || '',
        email: profileData.email || '',
        name: profileData.name || '',
        phone: profileData.phone || '',
        roles: profileData.roles || [],
        role: profileData.roles && profileData.roles.length > 0
          ? profileData.roles[0].name
          : (profileData.role || ''),
      };

      console.log('[Auth] Profile fetched successfully, roles:', user.roles);
      return user;
    } catch (error) {
      console.error('[Auth] Failed to fetch profile:', error);

      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        TokenManager.removeToken();
      }

      return null;
    }
  },


  logout(): void {
    console.log('[Auth] Logging out');
    TokenManager.removeToken();
  },


  isAuthenticated(): boolean {
    return TokenManager.hasToken();
  },

  getUserFromToken(): User | null {
    const payload = TokenManager.decodeToken<{
      user_id?: string;
      sub?: string;
      email?: string;
      name?: string;
      phone?: string;
      role?: string;
    }>();
    if (!payload) return null;

    return {
      id: payload.user_id || payload.sub?.toString() || '',
      email: payload.email || '',
      name: payload.name || '',
      phone: payload.phone || '',
      role: payload.role || '',
    };
  },
};

