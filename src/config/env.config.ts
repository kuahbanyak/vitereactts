
export const ADMIN_ROLE = import.meta.env.VITE_ADMIN_ROLE;
export const MANAGER_ROLE = import.meta.env.VITE_MANAGER_ROLE;
export const MECHANIC_ROLE = import.meta.env.VITE_MECHANIC_ROLE;
export const CUSTOMER_ROLE = import.meta.env.VITE_CUSTOMER_ROLE;
export const ROLE_NAMES = {
    ADMIN: ADMIN_ROLE,
    MANAGER: MANAGER_ROLE,
    MECHANIC: MECHANIC_ROLE,
    CUSTOMER: CUSTOMER_ROLE,
} as const;
