import React, {useEffect, useState, useCallback} from 'react';
import {AuthContext} from './auth-context-core';
import type {User} from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE = 'http://localhost:8080/api/v1';

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
                name: data.name ?? '',
                phone: data.phone ?? '',
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
        const init = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser({
                        id: payload.sub.toString(),
                        email: payload.email,
                        name: payload.name,
                        role: payload.role
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
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const data = await response.json();
            localStorage.setItem('token', data.token);
            try {
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                setUser({
                    id: payload.sub.toString(),
                    email: payload.email || email,
                    name: payload.name,
                    role: payload.role
                });
            } catch (error) {
                console.error('Error decoding token', error);
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

    const createUser = useCallback(async (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => {
        if (user?.role !== 'ADMIN') throw new Error('Forbidden');
        const res = await authFetch(`${API_BASE}/users`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create user');
        return (await res.json()) as User;
    }, [authFetch, user]);

    const updateUser = useCallback(async (id: string, payload: Partial<Omit<User, 'id'>>) => {
        if (user?.role !== 'ADMIN') throw new Error('Forbidden');
        const res = await authFetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update user');
        return (await res.json()) as User;
    }, [authFetch, user]);

    const deleteUser = useCallback(async (id: string) => {
        if (user?.role !== 'ADMIN') throw new Error('Forbidden');
        const res = await authFetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete user');
    }, [authFetch, user]);

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
