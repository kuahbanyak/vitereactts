/**
 * Role Names Configuration
 * Centralized role names from environment variables
 */

export const ROLE_NAMES = {
    ADMIN: import.meta.env.VITE_ADMIN_ROLE || 'admin',
    MANAGER: import.meta.env.VITE_MANAGER_ROLE || 'manager',
    MECHANIC: import.meta.env.VITE_MECHANIC_ROLE || 'mechanic',
    CUSTOMER: import.meta.env.VITE_CUSTOMER_ROLE || 'customer',
} as const;

/**
 * Type-safe role name type
 */
export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];

/**
 * Check if a role name is valid
 */
export function isValidRole(roleName: string): roleName is RoleName {
    return Object.values(ROLE_NAMES).includes(roleName as RoleName);
}
