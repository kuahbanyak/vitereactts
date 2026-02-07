import { apiClient } from './api-client';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/helpers';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface BaseServiceConfig {
  resourceName: string;
  endpoint: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export class BaseService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  protected config: Required<BaseServiceConfig>;

  constructor(config: BaseServiceConfig) {
    this.config = {
      showSuccessToast: true,
      showErrorToast: true,
      ...config,
    };
  }

  async getAll(): Promise<T[]> {
    try {
      const response = await apiClient.get<ApiResponse<T[]>>(this.config.endpoint);
      console.log(`[${this.config.resourceName}] API Response:`, response);
      let data: T[] = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        data = (response.data as any).data || [];
      }

      console.log(`[${this.config.resourceName}] Extracted data:`, data);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      if (this.config.showErrorToast) {
        toast.error(`Failed to fetch ${this.config.resourceName}: ${message}`);
      }
      console.error(`Error fetching ${this.config.resourceName}:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<T> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(`${this.config.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      if (this.config.showErrorToast) {
        toast.error(`Failed to fetch ${this.config.resourceName}: ${message}`);
      }
      console.error(`Error fetching ${this.config.resourceName} by ID:`, error);
      throw error;
    }
  }

  async create(data: TCreate): Promise<T> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(this.config.endpoint, data);
      if (this.config.showSuccessToast) {
        toast.success(`${this.config.resourceName} created successfully`);
      }
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      if (this.config.showErrorToast) {
        toast.error(`Failed to create ${this.config.resourceName}: ${message}`);
      }
      console.error(`Error creating ${this.config.resourceName}:`, error);
      throw error;
    }
  }


  async update(id: string, data: TUpdate): Promise<T | void> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(`${this.config.endpoint}/${id}`, data);
      if (this.config.showSuccessToast) {
        toast.success(`${this.config.resourceName} updated successfully`);
      }
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      if (this.config.showErrorToast) {
        toast.error(`Failed to update ${this.config.resourceName}: ${message}`);
      }
      console.error(`Error updating ${this.config.resourceName}:`, error);
      throw error;
    }
  }


  async patch(id: string, data: Partial<TUpdate>): Promise<T | void> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(`${this.config.endpoint}/${id}`, data);
      if (this.config.showSuccessToast) {
        toast.success(`${this.config.resourceName} updated successfully`);
      }
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      if (this.config.showErrorToast) {
        toast.error(`Failed to update ${this.config.resourceName}: ${message}`);
      }
      console.error(`Error patching ${this.config.resourceName}:`, error);
      throw error;
    }
  }


  async delete(id: string, displayName?: string): Promise<void> {
    try {
      await apiClient.delete(`${this.config.endpoint}/${id}`);
      if (this.config.showSuccessToast) {
        const name = displayName || this.config.resourceName;
        toast.success(`${name} deleted successfully`);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      if (this.config.showErrorToast) {
        toast.error(`Failed to delete ${this.config.resourceName}: ${message}`);
      }
      console.error(`Error deleting ${this.config.resourceName}:`, error);
      throw error;
    }
  }
}

