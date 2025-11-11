import { useCallback } from 'react';
import { userService } from './userService';
import { parseFullName } from '@/utils/helpers';
import { useResourceManagement, useFormState } from '@/hooks/useResource';
import type { User, UserFormData } from './types';

/**
 * Hook for managing users (CRUD operations)
 */
export function useUserManagement() {
  const resourceManager = useResourceManagement<User>(userService, {
    confirmDelete: true,
    deleteMessage: (name) => `Are you sure you want to delete user "${name}"?`,
  });

  // Alias methods with better names
  const fetchUsers = resourceManager.fetchItems;
  const updateUser = resourceManager.updateItem;

  // Custom delete that uses the special deleteUser method
  const deleteUser = useCallback(
    async (userId: string, userName: string) => {
      await resourceManager.deleteItem(userId, userName);
    },
    [resourceManager]
  );

  return {
    users: resourceManager.items,
    loading: resourceManager.loading,
    actionLoading: resourceManager.actionLoading,
    error: resourceManager.error,
    fetchUsers,
    updateUser,
    deleteUser,
    refresh: resourceManager.refresh,
  };
}

/**
 * Hook for managing user form state
 */
export function useUserForm() {
  const form = useFormState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'customer',
  });

  // Custom initialize method that parses full name
  const initializeForm = useCallback(
    (user: User) => {
      const { firstName, lastName } = parseFullName(user.name);
      form.setForm({
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        role: user.role.toLowerCase(),
      });
    },
    [form]
  );

  return {
    formData: form.formData,
    isDirty: form.isDirty,
    initializeForm,
    updateFormData: form.updateForm,
    resetForm: form.resetForm,
  };
}

