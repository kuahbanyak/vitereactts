import React, { useEffect, useState, useCallback } from 'react';
import { AuthContext } from './auth-context-core';
import { authService, TokenManager } from '@/services/auth.service';
import type { User } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const init = async () => {
      if (TokenManager.hasToken()) {
        // Try to get user from token first (fast)
        const userFromToken = authService.getUserFromToken();
        if (userFromToken) {
          setUser(userFromToken);
        }

        // Then fetch fresh profile (accurate)
        const profile = await authService.getProfile();
        if (profile) {
          setUser(profile);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  /**
   * Get current user profile
   */
  const getProfile = useCallback(async (): Promise<User | null> => {
    const profile = await authService.getProfile();
    if (profile) {
      setUser(profile);
    } else {
      setUser(null);
    }
    return profile;
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { user: userData } = await authService.login({ email, password });

    if (userData) {
      setUser(userData);
    }

    // Fetch fresh profile to get latest data
    await getProfile();
  }, [getProfile]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

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
