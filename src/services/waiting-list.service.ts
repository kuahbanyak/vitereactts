import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/config/api.config';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/helpers';
import type {
    WaitingListEntry,
    ServiceProgress,
    QueueStatus,
    TakeQueuePayload,
    UpdateQueuePayload,
    AssignMechanicPayload,
    QueueAvailability,
    AdminTicketCount,
    Vehicle,
    ServiceItem,
    AllProgressItem,
    AllProgressResponse,
} from '@/types/waiting-list.types';

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export const waitingListService = {
    /**
     * Take a queue ticket with existing or new vehicle
     */
    async takeQueue(payload: TakeQueuePayload): Promise<WaitingListEntry> {
        try {
            const response = await apiClient.post<ApiResponse<WaitingListEntry>>(
                API_ENDPOINTS.WAITING_LIST.TAKE,
                payload
            );
            toast.success('Queue ticket created successfully!');
            return response.data;
        } catch (error) {
            const message = getErrorMessage(error);
            toast.error(`Failed to take queue: ${message}`);
            throw error;
        }
    },

    /**
     * Get all queue entries for authenticated user
     */
    async getMyQueue(): Promise<WaitingListEntry[]> {
        try {
            const response = await apiClient.get<ApiResponse<WaitingListEntry[]>>(
                API_ENDPOINTS.WAITING_LIST.MY_QUEUE
            );
            // Handle both array response and nested data
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return (response.data as any).data || [];
        } catch (error) {
            toast.error(`Failed to fetch your queue`);
            throw error;
        }
    },

    /**
     * Get today's queue entries
     */
    async getTodayQueue(): Promise<WaitingListEntry[]> {
        try {
            const response = await apiClient.get<ApiResponse<WaitingListEntry[]>>(
                API_ENDPOINTS.WAITING_LIST.TODAY
            );
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return (response.data as any).data || [];
        } catch (error) {
            toast.error(`Failed to fetch today's queue`);
            throw error;
        }
    },

    /**
     * Get queue entries by specific date
     */
    async getQueueByDate(date: string): Promise<WaitingListEntry[]> {
        try {
            const response = await apiClient.get<ApiResponse<WaitingListEntry[]>>(
                `${API_ENDPOINTS.WAITING_LIST.BY_DATE}?date=${encodeURIComponent(date)}`
            );
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return (response.data as any).data || [];
        } catch (error) {
            toast.error(`Failed to fetch queue for date`);
            throw error;
        }
    },

    /**
     * Get queue by queue number and date
     */
    async getQueueByNumber(queueNumber: number, date: string): Promise<WaitingListEntry> {
        try {
            const response = await apiClient.get<ApiResponse<WaitingListEntry>>(
                `${API_ENDPOINTS.WAITING_LIST.BY_NUMBER(queueNumber)}?date=${encodeURIComponent(date)}`
            );
            return response.data;
        } catch (error) {
            toast.error(`Failed to fetch queue`);
            throw error;
        }
    },

    /**
     * Get real-time progress for specific queue
     */
    async getQueueProgress(id: string): Promise<ServiceProgress> {
        try {
            const response = await apiClient.get<ApiResponse<ServiceProgress>>(
                API_ENDPOINTS.WAITING_LIST.PROGRESS(id)
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch queue progress:', error);
            throw error;
        }
    },

    /**
     * Cancel own queue ticket
     */
    async cancelQueue(id: string): Promise<void> {
        try {
            await apiClient.put(API_ENDPOINTS.WAITING_LIST.CANCEL(id));
            toast.success('Queue cancelled successfully');
        } catch (error) {
            toast.error(`Failed to cancel queue`);
            throw error;
        }
    },

    /**
     * Check availability for a specific date
     */
    async checkAvailability(date: string): Promise<QueueAvailability> {
        try {
            const response = await apiClient.get<ApiResponse<QueueAvailability>>(
                `${API_ENDPOINTS.WAITING_LIST.AVAILABILITY}?date=${encodeURIComponent(date)}`
            );
            return response.data;
        } catch (error) {
            toast.error(`Failed to check availability`);
            throw error;
        }
    },

    /**
     * Get all queue progress (Admin/Mechanic only)
     * The endpoint returns: { data: { progress_list: [...], total_queues, date, currently_serving } }
     */
    async getAllProgress(date?: string): Promise<AllProgressItem[]> {
        try {
            const endpoint = date
                ? `${API_ENDPOINTS.MECHANIC.ALL_PROGRESS}?date=${encodeURIComponent(date)}`
                : API_ENDPOINTS.MECHANIC.ALL_PROGRESS;

            const response = await apiClient.get<ApiResponse<AllProgressResponse>>(endpoint);
            // Response shape: { data: { progress_list: [...], ... } }
            const body = response.data as any;
            if (Array.isArray(body)) return body;
            if (body?.progress_list) return body.progress_list;
            if (body?.data?.progress_list) return body.data.progress_list;
            return [];
        } catch (error) {
            toast.error(`Failed to fetch all progress`);
            throw error;
        }
    },

    /**
     * Get all customers' queue entries as WaitingListEntry[] for a given date (Admin/Mechanic only).
     * Primary source: getAllProgress() which returns all tickets for the date (all statuses).
     * Falls back to merging with getAvailableQueues() in case any waiting tickets are missed.
     */
    async getAdminQueueForDate(date?: string): Promise<WaitingListEntry[]> {
        const [availableResult, progressResult] = await Promise.allSettled([
            this.getAvailableQueues(date),
            this.getAllProgress(date),
        ]);

        const entries: WaitingListEntry[] = [];

        // Map all-progress items to WaitingListEntry (covers all statuses including waiting & canceled)
        if (progressResult.status === 'fulfilled') {
            const mappedProgress = progressResult.value.map(p => ({
                id: p.id,
                user_id: '',
                vehicle_id: '',
                queue_number: p.queue_number,
                service_type: p.service_type,
                service_date: p.service_date,
                status: (p.status === 'canceled' ? 'cancelled' : p.status) as QueueStatus,
                notes: undefined,
                estimated_time: p.estimated_time_minutes,
                mechanic_notes: p.mechanic_notes,
                mechanic_id: undefined,
                mechanic_name: p.mechanic_name,
                created_at: p.timeline?.queue_taken_at ?? '',
                updated_at: p.timeline?.queue_taken_at ?? '',
                user_name: p.customer_name,
                user_email: undefined,
                user_phone: p.customer_phone,
                vehicle: p.vehicle_brand ? {
                    id: '',
                    brand: p.vehicle_brand,
                    model: p.vehicle_model ?? '',
                    year: 0,
                    license_plate: p.license_plate ?? '',
                } : undefined,
            } as WaitingListEntry));
            entries.push(...mappedProgress);
        }

        // Also include available-queues results (in case any waiting tickets weren't in progress/all)
        if (availableResult.status === 'fulfilled') {
            entries.push(...availableResult.value);
        }

        // Deduplicate (progress/all entries take priority) then sort by queue number
        const seen = new Set<string>();
        const deduped = entries.filter(e => {
            if (seen.has(e.id)) return false;
            seen.add(e.id);
            return true;
        });

        return deduped.sort((a, b) => a.queue_number - b.queue_number);
    },

    /**
     * Get available queues (Mechanic only)
     */
    async getAvailableQueues(date?: string): Promise<WaitingListEntry[]> {
        try {
            const endpoint = date
                ? `${API_ENDPOINTS.MECHANIC.AVAILABLE_QUEUES}?date=${encodeURIComponent(date)}`
                : API_ENDPOINTS.MECHANIC.AVAILABLE_QUEUES;

            const response = await apiClient.get<ApiResponse<WaitingListEntry[]>>(endpoint);
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return (response.data as any).data || [];
        } catch (error) {
            toast.error(`Failed to fetch available queues`);
            throw error;
        }
    },

    /**
     * Assign mechanic to queue (Mechanic only)
     */
    async assignMechanic(payload: AssignMechanicPayload): Promise<WaitingListEntry> {
        try {
            const response = await apiClient.post<ApiResponse<WaitingListEntry>>(
                API_ENDPOINTS.MECHANIC.ASSIGN,
                payload
            );
            toast.success('Assigned to queue successfully');
            return response.data;
        } catch (error) {
            toast.error(`Failed to assign mechanic`);
            throw error;
        }
    },

    /**
     * Update queue estimate and notes (Mechanic/Admin only)
     */
    async updateQueueEstimate(id: string, payload: UpdateQueuePayload): Promise<void> {
        try {
            await apiClient.put(API_ENDPOINTS.MECHANIC.UPDATE(id), payload);
            toast.success('Queue updated successfully');
        } catch (error) {
            toast.error(`Failed to update queue`);
            throw error;
        }
    },

    /**
     * Call customer (Admin/Mechanic only)
     */
    async callCustomer(id: string): Promise<void> {
        try {
            await apiClient.put(API_ENDPOINTS.MECHANIC.CALL(id));
            toast.success('Customer called');
        } catch (error) {
            toast.error(`Failed to call customer`);
            throw error;
        }
    },

    /**
     * Start service (Admin/Mechanic only)
     */
    async startService(id: string): Promise<void> {
        try {
            await apiClient.put(API_ENDPOINTS.MECHANIC.START(id));
            toast.success('Service started');
        } catch (error) {
            toast.error(`Failed to start service`);
            throw error;
        }
    },

    /**
     * Complete service (Admin/Mechanic only)
     */
    async completeService(id: string): Promise<void> {
        try {
            await apiClient.put(API_ENDPOINTS.MECHANIC.COMPLETE(id));
            toast.success('Service completed');
        } catch (error) {
            toast.error(`Failed to complete service`);
            throw error;
        }
    },

    /**
     * Mark as no show (Admin/Mechanic only)
     */
    async markNoShow(id: string): Promise<void> {
        try {
            await apiClient.put(API_ENDPOINTS.MECHANIC.NO_SHOW(id));
            toast.success('Marked as no show');
        } catch (error) {
            toast.error(`Failed to mark as no show`);
            throw error;
        }
    },

    /**
     * Get system-wide weekly ticket count stats (Admin only)
     */
    async getAdminTicketCount(): Promise<AdminTicketCount> {
        try {
            const response = await apiClient.get<ApiResponse<AdminTicketCount>>(
                API_ENDPOINTS.ADMIN.TICKET_COUNT
            );
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch ticket count');
            throw error;
        }
    },

    /**
     * Get ticket count stats for the authenticated customer
     */
    async getMyTicketCount(): Promise<AdminTicketCount> {
        try {
            const response = await apiClient.get<ApiResponse<AdminTicketCount>>(
                API_ENDPOINTS.WAITING_LIST.MY_TICKET_COUNT
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch my ticket count:', error);
            throw error;
        }
    },
};

/**
 * Vehicle Service for queue form
 */
export const vehicleService = {
    async getMyVehicles(): Promise<Vehicle[]> {
        try {
            const response = await apiClient.get<ApiResponse<Vehicle[]>>(
                API_ENDPOINTS.VEHICLES.BASE
            );
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return (response.data as any).data || [];
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            throw error;
        }
    },
};

/**
 * Service Items for autocomplete in queue form
 */
export const serviceItemService = {
    async getServiceItems(): Promise<ServiceItem[]> {
        try {
            const response = await apiClient.get<ApiResponse<ServiceItem[]>>(
                API_ENDPOINTS.SERVICE_ITEMS.BASE
            );
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return (response.data as any).data || [];
        } catch (error) {
            console.error('Failed to fetch service items:', error);
            return []; // Return empty array instead of throwing to not break the form
        }
    },
};
