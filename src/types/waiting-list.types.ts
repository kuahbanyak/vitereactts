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

/** Shape of each item in the progress/all endpoint's progress_list array */
export interface AllProgressItem {
    id: string;
    queue_number: number;
    status: string; // API may return 'canceled' (one l); normalize to QueueStatus on use
    status_message?: string;
    vehicle_brand?: string;
    vehicle_model?: string;
    license_plate?: string;
    customer_name?: string;
    customer_phone?: string;
    service_type: string;
    service_date: string;
    estimated_time_minutes?: number;
    queue_position?: number;
    people_ahead?: number;
    estimated_wait_minutes?: number;
    mechanic_name?: string;
    mechanic_notes?: string;
    timeline?: {
        queue_taken_at?: string;
        called_at?: string;
        service_started_at?: string;
        service_completed_at?: string;
    };
}

/** Wrapper returned by the progress/all endpoint's data field */
export interface AllProgressResponse {
    currently_serving: number;
    date: string;
    progress_list: AllProgressItem[];
    total_queues: number;
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
    total_tickets: number;
    active_tickets: number;
    completed_tickets: number;
    canceled_tickets: number;
    system_active: boolean;
    accepting_bookings: boolean;
    available: boolean;
    remaining_tickets: number;
    max_tickets_per_week: number;
    week_start: string;
    week_end: string;
    date: string;
    message: string;
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
