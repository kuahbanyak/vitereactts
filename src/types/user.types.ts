// Shared user-related TypeScript interfaces and types

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  [key: string]: string;
}

export type RoleType = 'admin' | 'mechanic' | 'customer';

