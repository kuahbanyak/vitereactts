import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './auth-context-core';
import { authService, TokenManager } from '@/services/auth.service';
import { isTokenExpired } from '@/utils/helpers';
import type { User } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const init = async () => {
      if (TokenManager.hasToken()) {
        const userFromToken = authService.getUserFromToken();
        if (userFromToken) {
          setUser(userFromToken);
        }
        const profile = await authService.getProfile();
        if (profile) {
          setUser(profile);
        } else {
          logout();
        }
      }
      setIsLoading(false);
    };
    init();
  }, [logout]);

  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const token = TokenManager.getToken();

      if (token && isTokenExpired(token)) {
        console.warn('[Auth] Token expired, logging out...');
        logout();
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(checkTokenInterval);
  }, [logout]);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.status === 401) {
        console.warn('[Auth] Received 401 error, logging out...');
        logout();
      }
    };

    window.addEventListener('api-error', handleApiError);
    return () => window.removeEventListener('api-error', handleApiError);
  }, [logout]);


  const getProfile = useCallback(async (): Promise<User | null> => {
    const profile = await authService.getProfile();
    if (profile) {
      setUser(profile);
    } else {
      setUser(null);
    }
    return profile;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { user: userData } = await authService.login({ email, password });

    if (userData) {
      setUser(userData);
    }

    await getProfile();
  }, [getProfile]);

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
