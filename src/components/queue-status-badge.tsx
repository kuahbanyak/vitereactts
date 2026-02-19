import { Badge } from '@/components/ui/badge';
import type { QueueStatus } from '@/types/waiting-list.types';

interface QueueStatusBadgeProps {
    status: QueueStatus;
    className?: string;
}

const statusConfig: Record<QueueStatus, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
    waiting: { label: 'Waiting', variant: 'secondary' },
    called: { label: 'Called', variant: 'default' },
    in_service: { label: 'In Service', variant: 'default' },
    completed: { label: 'Completed', variant: 'outline' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
    no_show: { label: 'No Show', variant: 'destructive' },
};

export function QueueStatusBadge({ status, className }: QueueStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.waiting;

    return (
        <Badge variant={config.variant} className={className}>
            {config.label}
        </Badge>
    );
}
