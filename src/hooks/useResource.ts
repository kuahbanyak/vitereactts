import { useState, useCallback } from 'react';
import type { BaseService } from '@/services/base.service';

export interface UseResourceConfig {
  confirmDelete?: boolean;
  deleteMessage?: (name: string) => string;
}

export function useResourceManagement<T extends { id: string; name?: string }>(
  service: BaseService<T, unknown, unknown>,
  config: UseResourceConfig = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const {
    confirmDelete = true,
    deleteMessage = (name) => `Are you sure you want to delete "${name}"?`,
  } = config;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  const fetchItem = useCallback(
    async (id: string) => {
      setActionLoading(id);
      setError(null);
      try {
        return await service.getById(id);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch item'));
        throw err;
      } finally {
        setActionLoading(null);
      }
    },
    [service]
  );

  const createItem = useCallback(
    async (data: unknown) => {
      setLoading(true);
      setError(null);
      try {
        const newItem = await service.create(data);
        await fetchItems();
        return newItem;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create item'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchItems]
  );

  const updateItem = useCallback(
    async (id: string, data: unknown) => {
      setActionLoading(id);
      setError(null);
      try {
        await service.update(id, data);
        await fetchItems();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update item'));
        throw err;
      } finally {
        setActionLoading(null);
      }
    },
    [service, fetchItems]
  );


  const deleteItem = useCallback(
    async (id: string, displayName?: string) => {
      const name = displayName || 'this item';

      if (confirmDelete && !confirm(deleteMessage(name))) {
        return;
      }

      setActionLoading(id);
      setError(null);
      try {
        await service.delete(id, displayName);
        await fetchItems();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete item'));
        throw err;
      } finally {
        setActionLoading(null);
      }
    },
    [service, fetchItems, confirmDelete, deleteMessage]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = fetchItems;
  return {
    items,
    loading,
    actionLoading,
    error,
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    refresh,
    clearError,
    isLoadingItem: (id: string) => actionLoading === id,
  };
}


export function useFormState<T extends Record<string, unknown>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [isDirty, setIsDirty] = useState(false);

  const updateForm = useCallback((data: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setIsDirty(true);
  }, []);

  const setForm = useCallback((data: T) => {
    setFormData(data);
    setIsDirty(false);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setIsDirty(false);
  }, [initialState]);

  const updateField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  return {
    formData,
    isDirty,
    updateForm,
    setForm,
    resetForm,
    updateField,
  };
}

export function useModalState<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T) => {
    setData(modalData || null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setData(null), 300);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}

