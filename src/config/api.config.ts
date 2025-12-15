/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Get API base URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: 'api/v1/auth/login',
    REGISTER: 'api/v1/auth/register',
    LOGOUT: 'api/v1/auth/logout',
    PROFILE: 'api/v1/users/profile',
  },
  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
  },
} as const;

// API configuration settings
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// HTTP methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

