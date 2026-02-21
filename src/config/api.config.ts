/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Get API base URL from environment variable
// Default to empty string to use relative URLs (works with Netlify proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// API endpoints - all use leading slash for consistent URL construction
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    PROFILE: '/api/v1/users/profile',
  },
  // User endpoints
  USERS: {
    BASE: '/api/v1/users',
    BY_ID: (id: string) => `/api/v1/users/${id}`,
    PROFILE: '/api/v1/users/profile',
  },
  // Waiting List / Queue endpoints
  WAITING_LIST: {
    TAKE: '/api/v1/waiting-list/take',
    MY_QUEUE: '/api/v1/waiting-list/my-queue',
    TODAY: '/api/v1/waiting-list/today',
    BY_DATE: '/api/v1/waiting-list/date',
    BY_NUMBER: (queueNumber: number) => `/api/v1/waiting-list/number/${queueNumber}`,
    PROGRESS: (id: string) => `/api/v1/waiting-list/${id}/progress`,
    CANCEL: (id: string) => `/api/v1/waiting-list/${id}/cancel`,
    AVAILABILITY: '/api/v1/waiting-list/availability',
    MY_TICKET_COUNT: '/api/v1/waiting-list/my-ticket-count',
  },
  // Admin-only endpoints
  ADMIN: {
    TICKET_COUNT: '/api/v1/admin/waiting-list/ticket-count',
    AVAILABILITY: '/api/v1/waiting-list/availability',
  },
  // Mechanic / Admin endpoints for queue management
  MECHANIC: {
    ALL_PROGRESS: '/api/v1/mechanic/waiting-list/progress/all',
    AVAILABLE_QUEUES: '/api/v1/mechanic/waiting-list/available',
    ASSIGN: '/api/v1/mechanic/waiting-list/assign',
    UPDATE: (id: string) => `/api/v1/mechanic/waiting-list/${id}`,
    CALL: (id: string) => `/api/v1/mechanic/waiting-list/${id}/call`,
    START: (id: string) => `/api/v1/mechanic/waiting-list/${id}/start`,
    COMPLETE: (id: string) => `/api/v1/mechanic/waiting-list/${id}/complete`,
    NO_SHOW: (id: string) => `/api/v1/mechanic/waiting-list/${id}/no-show`,
  },
  // Vehicle endpoints
  VEHICLES: {
    BASE: '/api/v1/vehicles',
    BY_ID: (id: string) => `/api/v1/vehicles/${id}`,
  },
  // Service Item endpoints
  SERVICE_ITEMS: {
    BASE: '/api/v1/service-items',
    GROUPED: '/api/v1/service-items/grouped',
    BY_ID: (id: string) => `/api/v1/service-items/${id}`,
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

