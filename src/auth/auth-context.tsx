import React, { useEffect, useState, useCallback } from 'react';
import { AuthContext } from './auth-context-core';
import type { User } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE = '/api/v1';

  const authFetch = useCallback(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401) {
      localStorage.removeItem('token');
      setUser(null);
      throw new Error('Unauthorized');
    }
    return res;
  }, []);

  const getProfile = async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }

    console.log('Token exists, making profile request to:', `${API_BASE}/users/profile`);
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');

    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Profile response status:', res.status);
      console.log('Profile response headers:', Object.fromEntries(res.headers.entries()));

      if (res.status === 401) {
        console.log('Token invalid/expired, clearing localStorage');
        localStorage.removeItem('token');
        setUser(null);
        return null;
      }
      if (!res.ok) {
        console.error('Failed to fetch profile:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('Error response body:', errorText);
        return null;
      }
      const data = await res.json();
      console.log('Profile data received:', data);

      // Check if profile response has the same structure as login response
      const profileData = data.data || data; // Handle both {data: {user}} and direct user object
      const profile: User = {
        id: profileData.id?.toString?.() ?? profileData.id ?? '',
        email: profileData.email ?? '',
        name: profileData.name ?? '',
        phone: profileData.phone ?? '',
        role: profileData.role ?? '',
      };
      console.log('Setting user profile:', profile);
      setUser(profile);
      return profile;
    } catch (e) {
      console.error('Error fetching profile', e);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('JWT payload on init:', payload);
          setUser({
            id: payload.user_id || payload.sub?.toString() || '',
            email: payload.email || '',
            name: payload.name || '',
            role: payload.role || '',
          });
        } catch (error) {
          console.error('Invalid token', error);
          localStorage.removeItem('token');
        }
        await getProfile();
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json();
      console.log('Login response data:', data);

      const token = data.data?.access_token;
      if (!token) {
        console.error('No access_token found in login response. Response keys:', Object.keys(data));
        console.error(
          'Data object keys:',
          data.data ? Object.keys(data.data) : 'data object is null/undefined'
        );
        throw new Error('No authentication token received from server');
      }

      localStorage.setItem('token', token);
      console.log('Token stored successfully, length:', token.length);

      const userData = data.data?.user;
      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
        });
        console.log('User data set from login response:', userData);
      } else {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Decoded JWT payload:', payload);
          setUser({
            id: payload.user_id || payload.sub?.toString(),
            email: email,
            name: payload.name || '',
            phone: payload.phone || '',
            role: payload.role,
          });
        } catch (error) {
          console.error('Error decoding token:', error);
          console.error('Token value:', token);
        }
      }
      await getProfile();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Admin: list users
  const listUsers = useCallback(async () => {
    if (user?.role !== 'ADMIN') throw new Error('Forbidden');
    const res = await authFetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to load users');
    return (await res.json()) as User[];
  }, [authFetch, user]);

  const createUser = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role?: string;
    }) => {
      if (user?.role !== 'ADMIN') throw new Error('Forbidden');
      const res = await authFetch(`${API_BASE}/users`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create user');
      return (await res.json()) as User;
    },
    [authFetch, user]
  );

  const updateUser = useCallback(
    async (id: string, payload: Partial<Omit<User, 'id'>>) => {
      if (user?.role !== 'ADMIN') throw new Error('Forbidden');
      const res = await authFetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return (await res.json()) as User;
    },
    [authFetch, user]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      if (user?.role !== 'ADMIN') throw new Error('Forbidden');
      const res = await authFetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
    },
    [authFetch, user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        getProfile,
        ...(user?.role === 'ADMIN' ? { listUsers, createUser, updateUser, deleteUser } : {}),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
