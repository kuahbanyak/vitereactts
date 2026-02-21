import { apiClient } from './api-client';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

export type VisitorStatsPeriod = '7days' | '30days' | '3months';

export interface ServiceCategoryStats {
    category: string;
    visitor_count: number;
    ticket_count: number;
    percentage: number;
}

export interface DailyVisitorStats {
    date: string;
    visitor_count: number;
    ticket_count: number;
    new_customers: number;
}

export interface VisitorStats {
    period: VisitorStatsPeriod;
    total_visitors: number;
    total_tickets: number;
    new_customers: number;
    returning_customers: number;
    by_service_category: ServiceCategoryStats[];
    by_date: DailyVisitorStats[];
    timestamp?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const analyticsService = {
    /**
     * Get visitor statistics for a given time period (Admin only).
     * GET /api/v1/admin/analytics/visitor-stats?period=30days
     */
    async getVisitorStats(period: VisitorStatsPeriod = '30days'): Promise<VisitorStats> {
        try {
            const response = await apiClient.get<{ data: VisitorStats }>(
                `/api/v1/admin/analytics/visitor-stats?period=${period}`
            );
            // Handle: { data: { ... } } or { success, message, data: { ... } }
            const body = response.data as any;
            if (body?.period) return body as VisitorStats;          // direct data
            if (body?.data?.period) return body.data as VisitorStats; // nested
            return body as VisitorStats;
        } catch (error) {
            toast.error('Failed to fetch visitor statistics');
            throw error;
        }
    },
};
