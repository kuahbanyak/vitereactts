import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QueueStatusBadge } from './queue-status-badge';
import type { WaitingListEntry } from '@/types/waiting-list.types';
import { IconCar, IconUser, IconClock, IconCalendar, IconPhone, IconTool } from '@tabler/icons-react';
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

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
    const isAdminOrMech = isAdmin || isMechanic;
    const isCustomer = currentUser && hasRole(currentUser, ROLE_NAMES.CUSTOMER);

    const canCancel = isCustomer && (queue.status === 'waiting' || queue.status === 'called');
    const canCall = isAdminOrMech && queue.status === 'waiting';
    const canStart = isAdminOrMech && queue.status === 'called';
    const canComplete = isAdminOrMech && queue.status === 'in_service';
    const canAssign = isMechanic && !queue.mechanic_id;

    const isDone = queue.status === 'completed' || queue.status === 'cancelled' || queue.status === 'no_show';

    return (
        <Card className={`border-0 shadow-sm transition-colors ${isDone ? 'opacity-75' : ''}`}>
            <CardContent className="p-0">
                {/* ── Main row ─────────────────────────────────────── */}
                <div className="flex items-start gap-3 p-4">
                    {/* Queue number bubble */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-sm">
                        #{queue.queue_number}
                    </div>

                    {/* Middle info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Title row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold truncate">{queue.service_type}</span>
                            <QueueStatusBadge status={queue.status} />
                        </div>

                        {/* Detail pills */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <IconCalendar size={12} />
                                {formatDate(queue.service_date)}
                            </span>

                            {queue.vehicle && (
                                <span className="flex items-center gap-1">
                                    <IconCar size={12} />
                                    {queue.vehicle.brand} {queue.vehicle.model} · {queue.vehicle.license_plate}
                                </span>
                            )}

                            {isAdminOrMech && queue.user_name && (
                                <span className="flex items-center gap-1">
                                    <IconUser size={12} />
                                    {queue.user_name}
                                    {queue.user_phone && <span>· {queue.user_phone}</span>}
                                </span>
                            )}

                            {queue.mechanic_name && (
                                <span className="flex items-center gap-1">
                                    <IconTool size={12} />
                                    {queue.mechanic_name}
                                </span>
                            )}

                            {showProgress && position !== undefined && (
                                <span className="flex items-center gap-1">
                                    <IconClock size={12} />
                                    Position #{position}
                                    {estimatedWait && estimatedWait > 0 && ` · ~${estimatedWait}m wait`}
                                </span>
                            )}

                            {queue.estimated_time && queue.estimated_time > 0 && (
                                <span className="flex items-center gap-1">
                                    <IconClock size={12} />
                                    ~{queue.estimated_time}m service
                                </span>
                            )}
                        </div>

                        {/* Notes (compact) */}
                        {queue.notes && (
                            <p className="text-xs text-muted-foreground bg-muted/60 rounded px-2 py-1 truncate">
                                📝 {queue.notes}
                            </p>
                        )}
                        {queue.mechanic_notes && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded px-2 py-1 truncate">
                                🔧 {queue.mechanic_notes}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Action row (only if there are actions) ──────── */}
                {(canCancel || canCall || canStart || canComplete || canAssign ||
                    (isAdminOrMech && onNoShow && queue.status !== 'no_show' && queue.status !== 'completed') ||
                    (isAdminOrMech && onUpdate && queue.mechanic_id)
                ) && (
                        <div className="flex flex-wrap gap-1.5 border-t border-border/60 px-4 py-2.5">
                            {canCancel && onCancel && <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => onCancel(queue.id)}>Cancel</Button>}
                            {canAssign && onAssign && <Button variant="default" size="sm" className="h-7 text-xs" onClick={() => onAssign(queue.id)}>Assign to Me</Button>}
                            {canCall && onCall && <Button variant="default" size="sm" className="h-7 text-xs" onClick={() => onCall(queue.id)}>Call Customer</Button>}
                            {canStart && onStart && <Button variant="default" size="sm" className="h-7 text-xs" onClick={() => onStart(queue.id)}>Start Service</Button>}
                            {canComplete && onComplete && <Button variant="default" size="sm" className="h-7 text-xs" onClick={() => onComplete(queue.id)}>Complete</Button>}
                            {isAdminOrMech && onNoShow && queue.status !== 'no_show' && queue.status !== 'completed' &&
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onNoShow(queue.id)}>No Show</Button>
                            }
                            {isAdminOrMech && onUpdate && queue.mechanic_id &&
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onUpdate(queue.id)}>Update</Button>
                            }
                        </div>
                    )}
            </CardContent>
        </Card>
    );
}
