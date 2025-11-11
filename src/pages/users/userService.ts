import { BaseService } from '@/services/base.service';
import { API_ENDPOINTS } from '@/config/api.config';
import type { User, UpdateUserPayload } from './types';

/**
 * User Service
 * Handles all user-related API operations
 */
class UserService extends BaseService<User, Partial<User>, UpdateUserPayload> {
  constructor() {
    super({
      resourceName: 'User',
      endpoint: API_ENDPOINTS.USERS.BASE,
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  /**
   * Delete user with custom display name
   */
  async deleteUser(userId: string, userName: string): Promise<void> {
    return this.delete(userId, `User "${userName}"`);
  }
}

// Export singleton instance
export const userService = new UserService();

