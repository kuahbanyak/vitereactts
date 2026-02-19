import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QueueStatusBadge } from './queue-status-badge';
import type { WaitingListEntry } from '@/types/waiting-list.types';
import { IconCar, IconUser, IconClock, IconCalendar, IconPhone } from '@tabler/icons-react';
import { hasRole, type User } from '@/auth/types';
import { ROLE_NAMES } from '@/config/roles';

interface QueueCardProps {
    queue: WaitingListEntry;
    currentUser: User | null;
    onCancel?: (id: string) => Promise<void>;
    onCall?: (id: string) => Promise<void>;
    onStart?: (id: string) => Promise<void>;
    onComplete?: (id: string) => Promise<void>;
    onNoShow?: (id: string) => Promise<void>;
    onAssign?: (id: string) => Promise<void>;
    onUpdate?: (id: string) => void;
    showProgress?: boolean;
    position?: number;
    estimatedWait?: number;
}

export function QueueCard({
    queue,
    currentUser,
    onCancel,
    onCall,
    onStart,
    onComplete,
    onNoShow,
    onAssign,
    onUpdate,
    showProgress = false,
    position,
    estimatedWait,
}: QueueCardProps) {
    const isAdmin = currentUser && hasRole(currentUser, ROLE_NAMES.ADMIN);
    const isMechanic = currentUser && hasRole(currentUser, ROLE_NAMES.MECHANIC);
    const isAdminOrMechanic = isAdmin || isMechanic;
    const isCustomer = currentUser && hasRole(currentUser, ROLE_NAMES.CUSTOMER);

    const canCancel = isCustomer && (queue.status === 'waiting' || queue.status === 'called');
    const canCall = isAdminOrMechanic && queue.status === 'waiting';
    const canStart = isAdminOrMechanic && queue.status === 'called';
    const canComplete = isAdminOrMechanic && queue.status === 'in_service';
    const canAssign = isMechanic && !queue.mechanic_id;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xl font-bold text-primary">#{queue.queue_number}</span>
                        </div>
                        <div>
                            <CardTitle className="text-lg">{queue.service_type}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <IconCalendar size={14} />
                                {formatDate(queue.service_date)}
                            </CardDescription>
                        </div>
                    </div>
                    <QueueStatusBadge status={queue.status} />
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Vehicle Info */}
                {queue.vehicle && (
                    <div className="flex items-start gap-2 text-sm">
                        <IconCar size={18} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">
                                {queue.vehicle.brand} {queue.vehicle.model} ({queue.vehicle.year})
                            </p>
                            <p className="text-muted-foreground">{queue.vehicle.license_plate}</p>
                        </div>
                    </div>
                )}

                {/* Customer Info (for admin/mechanic) */}
                {isAdminOrMechanic && queue.user_name && (
                    <div className="flex items-start gap-2 text-sm">
                        <IconUser size={18} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">{queue.user_name}</p>
                            {queue.user_phone && (
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <IconPhone size={14} />
                                    {queue.user_phone}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Mechanic Info */}
                {queue.mechanic_name && (
                    <div className="flex items-start gap-2 text-sm">
                        <IconUser size={18} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <p className="text-muted-foreground">Mechanic</p>
                            <p className="font-medium">{queue.mechanic_name}</p>
                        </div>
                    </div>
                )}

                {/* Progress Info */}
                {showProgress && position !== undefined && (
                    <div className="flex items-start gap-2 text-sm">
                        <IconClock size={18} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Position: #{position}</p>
                            {estimatedWait !== undefined && estimatedWait > 0 && (
                                <p className="text-muted-foreground">Est. wait: ~{estimatedWait} min</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Estimated Time */}
                {queue.estimated_time && queue.estimated_time > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                        <IconClock size={18} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <p className="text-muted-foreground">Service Duration</p>
                            <p className="font-medium">~{queue.estimated_time} minutes</p>
                        </div>
                    </div>
                )}

                {/* Notes */}
                {queue.notes && (
                    <div className="rounded-md bg-muted p-2 text-sm">
                        <p className="font-medium">Notes:</p>
                        <p className="text-muted-foreground">{queue.notes}</p>
                    </div>
                )}

                {/* Mechanic Notes */}
                {queue.mechanic_notes && (
                    <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-2 text-sm">
                        <p className="font-medium">Mechanic Notes:</p>
                        <p className="text-muted-foreground">{queue.mechanic_notes}</p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
                {canCancel && onCancel && (
                    <Button variant="destructive" size="sm" onClick={() => onCancel(queue.id)}>
                        Cancel
                    </Button>
                )}
                {canAssign && onAssign && (
                    <Button variant="default" size="sm" onClick={() => onAssign(queue.id)}>
                        Assign to Me
                    </Button>
                )}
                {canCall && onCall && (
                    <Button variant="default" size="sm" onClick={() => onCall(queue.id)}>
                        Call Customer
                    </Button>
                )}
                {canStart && onStart && (
                    <Button variant="default" size="sm" onClick={() => onStart(queue.id)}>
                        Start Service
                    </Button>
                )}
                {canComplete && onComplete && (
                    <Button variant="default" size="sm" onClick={() => onComplete(queue.id)}>
                        Complete
                    </Button>
                )}
                {isAdminOrMechanic && onNoShow && queue.status !== 'no_show' && queue.status !== 'completed' && (
                    <Button variant="outline" size="sm" onClick={() => onNoShow(queue.id)}>
                        No Show
                    </Button>
                )}
                {isAdminOrMechanic && onUpdate && queue.mechanic_id && (
                    <Button variant="outline" size="sm" onClick={() => onUpdate(queue.id)}>
                        Update
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
