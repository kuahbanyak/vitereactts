
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }

  return 'An unknown error occurred';
}

export function isApiError(error: unknown): error is { message: string; status: number } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  );
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

export function combineNames(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

export function normalizeRole(role: string): string {
  return role.toLowerCase().trim();
}


export function hasRole(userRole: string | undefined, requiredRole: string): boolean {
  if (!userRole) return false;
  return normalizeRole(userRole) === normalizeRole(requiredRole);
}


export function isAdmin(userRole: string | undefined): boolean {
  return hasRole(userRole, 'admin');
}


export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  return phone.trim() || 'N/A';
}


export function capitalize(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}


export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('token');
}


export function hasToken(): boolean {
  return !!getStoredToken();
}


export function decodeToken<T = unknown>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = atob(parts[1]);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}


export function isTokenExpired(token: string): boolean {
  const payload = decodeToken<{ exp?: number }>(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

