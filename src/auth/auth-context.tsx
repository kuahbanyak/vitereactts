import React, { useEffect, useState } from 'react';
import { AuthContext } from './auth-context-core';
import type { User } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getProfile = async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const res = await fetch('http://localhost:8080/api/v1/me', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        // Token invalid/expired
        localStorage.removeItem('token');
        setUser(null);
        return null;
      }
      if (!res.ok) {
        console.error('Failed to fetch profile');
        return null;
      }
      const data = await res.json();
      const profile: User = {
        id: data.id?.toString?.() ?? data.id ?? '',
        email: data.email ?? '',
        name: data.name ?? data.fullName ?? '',
        phone: data.phone ?? data.phoneNumber ?? '',
        role: data.role,
      };
      setUser(profile);
      return profile;
    } catch (e) {
      console.error('Error fetching profile', e);
      return null;
    }
  };

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      // You might want to validate the token with your backend here
      // For now, just consider the user authenticated if token exists
      try {
        // Decode token to get user info or make an API call to get user data
  const payload = JSON.parse(atob(token.split('.')[1]));
  setUser({ id: payload.sub.toString(), email: payload.email || '', name: payload.name, role: payload.role });
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
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

      // Store token
      localStorage.setItem('token', data.token);

      // Decode token to get user info or make another API call
      try {
  const payload = JSON.parse(atob(data.token.split('.')[1]));
  setUser({ id: payload.sub.toString(), email: payload.email || email, name: payload.name, role: payload.role });
      } catch (error) {
        console.error('Error decoding token', error);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
  isLoading,
        login,
        logout,
  getProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
