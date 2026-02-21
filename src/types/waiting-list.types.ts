// Waiting List / Queue System Types

export type QueueStatus =
    | 'waiting'
    | 'called'
    | 'in_service'
    | 'completed'
    | 'cancelled'
    | 'no_show';

export interface Vehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    vin?: string;
    mileage?: number;
    color?: string;
}

export interface NewVehicle {
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    vin?: string;
    mileage?: number;
    color?: string;
}

export interface ServiceItem {
    id: string;
    name: string;
    description?: string;
    category: string;
    estimated_time: number;
    estimated_cost: number;
    display_order?: number;
    requires_booking?: boolean;
    is_active?: boolean;
}

export interface WaitingListEntry {
    id: string;
    user_id: string;
    vehicle_id: string;
    queue_number: number;
    service_type: string;
    service_date: string;
    status: QueueStatus;
    notes?: string;
    estimated_time?: number;
    mechanic_notes?: string;
    mechanic_id?: string;
    mechanic_name?: string;
    created_at: string;
    updated_at: string;
    // Extended fields from API
    user_name?: string;
    user_email?: string;
    user_phone?: string;
    vehicle?: Vehicle;
}

export interface ServiceProgress {
    queue_id: string;
    queue_number: number;
    position_in_queue: number;
    people_ahead: number;
    people_behind: number;
    estimated_wait_time: number;
    status: QueueStatus;
    service_type: string;
    service_date: string;
    mechanic_name?: string;
    mechanic_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface TakeQueuePayload {
    vehicle_id?: string;
    new_vehicle?: NewVehicle;
    service_item_id?: string;
    service_type: string;
    service_date: string;
    notes?: string;
}

export interface UpdateQueuePayload {
    estimated_time?: number;
    mechanic_notes?: string;
}

export interface AssignMechanicPayload {
    queue_id: string;
}

export interface QueueAvailability {
    date: string;
    week_start: string;
    week_end: string;
    available: boolean;
    remaining_tickets: number;
    max_tickets_per_week: number;
    system_active: boolean;
    accepting_bookings: boolean;
    message: string;
}

export interface AdminTicketCount {
    total: number;
    active: number;
    completed: number;
    week_start?: string;
    week_end?: string;
    remaining?: number;
    max_per_week?: number;
}

export interface QueueSummary {
    total: number;
    waiting: number;
    called: number;
    in_service: number;
    completed: number;
    cancelled: number;
    no_show: number;
}
