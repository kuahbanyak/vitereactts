/**
 * Environment Configuration
 * Access to environment variables with type safety
 */

// Admin role name (used for authorization checks)
export const ADMIN_ROLE = import.meta.env.VITE_ADMIN_ROLE || 'admin';

// Manager role name
export const MANAGER_ROLE = import.meta.env.VITE_MANAGER_ROLE || 'manager';

// Mechanic role name
export const MECHANIC_ROLE = import.meta.env.VITE_MECHANIC_ROLE || 'mechanic';

// Customer role name
export const CUSTOMER_ROLE = import.meta.env.VITE_CUSTOMER_ROLE || 'customer';

// All available roles
export const ROLE_NAMES = {
    ADMIN: ADMIN_ROLE,
    MANAGER: MANAGER_ROLE,
    MECHANIC: MECHANIC_ROLE,
    CUSTOMER: CUSTOMER_ROLE,
} as const;
