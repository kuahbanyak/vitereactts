import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QueueCard } from '@/components/queue-card';
import { QueueTicketForm } from '@/components/queue-ticket-form';
import { QueueProgressTracker } from '@/components/queue-progress-tracker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/auth/use-auth';
import { hasRole } from '@/auth/types';
import { ROLE_NAMES } from '@/config/roles';
import { waitingListService } from '@/services/waiting-list.service';
import type { WaitingListEntry, ServiceProgress, QueueSummary } from '@/types/waiting-list.types';
import { IconPlus, IconRefresh, IconCalendar } from '@tabler/icons-react';
import { toast } from 'sonner';

export function QueuePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [queues, setQueues] = useState<WaitingListEntry[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, ServiceProgress>>({});
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [summary, setSummary] = useState<QueueSummary | null>(null);

    // Update dialog
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [updateQueueId, setUpdateQueueId] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [mechanicNotes, setMechanicNotes] = useState('');

    const isAdmin = user && hasRole(user, ROLE_NAMES.ADMIN);
    const isMechanic = user && hasRole(user, ROLE_NAMES.MECHANIC);
    const isCustomer = user && hasRole(user, ROLE_NAMES.CUSTOMER);
    const isAdminOrMechanic = isAdmin || isMechanic;

    useEffect(() => {
        loadQueues();
    }, [selectedDate, user]);

    const loadQueues = async () => {
        if (!user) return;

        setLoading(true);
        try {
            let queueData: WaitingListEntry[] = [];

            if (isCustomer) {
                // Customer sees only their own queues
                queueData = await waitingListService.getMyQueue();
            } else if (isAdminOrMechanic) {
                // Admin/Mechanic see all queues for selected date
                if (selectedDate === new Date().toISOString().split('T')[0]) {
                    queueData = await waitingListService.getTodayQueue();
                } else {
                    queueData = await waitingListService.getQueueByDate(selectedDate);
                }
            }

            setQueues(queueData);

            // Calculate summary
            if (isAdminOrMechanic) {
                const summaryData: QueueSummary = {
                    total: queueData.length,
                    waiting: queueData.filter(q => q.status === 'waiting').length,
                    called: queueData.filter(q => q.status === 'called').length,
                    in_service: queueData.filter(q => q.status === 'in_service').length,
                    completed: queueData.filter(q => q.status === 'completed').length,
                    cancelled: queueData.filter(q => q.status === 'cancelled').length,
                    no_show: queueData.filter(q => q.status === 'no_show').length,
                };
                setSummary(summaryData);
            }

            // Load progress for each queue
            await loadProgress(queueData);
        } catch (error) {
            console.error('Failed to load queues:', error);
            toast.error('Failed to load queue data');
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async (queueData: WaitingListEntry[]) => {
        const progressData: Record<string, ServiceProgress> = {};

        for (const queue of queueData) {
            try {
                const progress = await waitingListService.getQueueProgress(queue.id);
                progressData[queue.id] = progress;
            } catch (error) {
                console.error(`Failed to load progress for queue ${queue.id}:`, error);
            }
        }

        setProgressMap(progressData);
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this queue ticket?')) return;

        console.log('[QueuePage] Cancelling queue:', id);
        setLoading(true);
        try {
            await waitingListService.cancelQueue(id);
            console.log('[QueuePage] Cancel successful, reloading queues...');
            await loadQueues();
            console.log('[QueuePage] Queues reloaded');
        } catch (error) {
            console.error('[QueuePage] Failed to cancel queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = async (id: string) => {
        try {
            await waitingListService.callCustomer(id);
            loadQueues();
        } catch (error) {
            console.error('Failed to call customer:', error);
        }
    };

    const handleStart = async (id: string) => {
        try {
            await waitingListService.startService(id);
            loadQueues();
        } catch (error) {
            console.error('Failed to start service:', error);
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await waitingListService.completeService(id);
            loadQueues();
        } catch (error) {
            console.error('Failed to complete service:', error);
        }
    };

    const handleNoShow = async (id: string) => {
        if (!confirm('Mark this customer as no-show?')) return;

        try {
            await waitingListService.markNoShow(id);
            loadQueues();
        } catch (error) {
            console.error('Failed to mark as no show:', error);
        }
    };

    const handleAssign = async (id: string) => {
        try {
            await waitingListService.assignMechanic({ queue_id: id });
            loadQueues();
        } catch (error) {
            console.error('Failed to assign mechanic:', error);
        }
    };

    const handleUpdate = (id: string) => {
        const queue = queues.find(q => q.id === id);
        if (queue) {
            setUpdateQueueId(id);
            setEstimatedTime(queue.estimated_time?.toString() || '');
            setMechanicNotes(queue.mechanic_notes || '');
            setShowUpdateDialog(true);
        }
    };

    const submitUpdate = async () => {
        try {
            await waitingListService.updateQueueEstimate(updateQueueId, {
                estimated_time: estimatedTime ? parseInt(estimatedTime) : undefined,
                mechanic_notes: mechanicNotes || undefined,
            });
            setShowUpdateDialog(false);
            loadQueues();
        } catch (error) {
            console.error('Failed to update queue:', error);
        }
    };

    const activeQueues = queues.filter(q =>
        q.status !== 'completed' && q.status !== 'cancelled' && q.status !== 'no_show'
    );

    return (
        <SidebarProvider
            style={{
                '--sidebar-width': 'calc(var(--spacing) * 72)',
                '--header-height': 'calc(var(--spacing) * 12)',
            } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Queue Management" />

                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">

                            {/* Header Actions */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isAdminOrMechanic && (
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="date" className="text-sm">Date:</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="w-auto"
                                            />
                                        </div>
                                    )}
                                    <Button variant="outline" size="sm" onClick={loadQueues} disabled={loading}>
                                        <IconRefresh size={16} className={loading ? 'animate-spin' : ''} />
                                        Refresh
                                    </Button>
                                </div>

                                {isCustomer && (
                                    <Button onClick={() => setShowTicketForm(true)}>
                                        <IconPlus size={18} />
                                        Take Queue
                                    </Button>
                                )}
                            </div>

                            {/* Summary Cards (Admin/Mechanic Only) */}
                            {isAdminOrMechanic && summary && (
                                <div className="grid gap-4 md:grid-cols-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardDescription>Total Queues</CardDescription>
                                            <CardTitle className="text-3xl">{summary.total}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardDescription>Waiting</CardDescription>
                                            <CardTitle className="text-3xl text-yellow-600">{summary.waiting}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardDescription>In Service</CardDescription>
                                            <CardTitle className="text-3xl text-blue-600">{summary.in_service}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardDescription>Completed</CardDescription>
                                            <CardTitle className="text-3xl text-green-600">{summary.completed}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                </div>
                            )}

                            {/* Queue List */}
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <p className="text-muted-foreground">Loading queues...</p>
                                </div>
                            ) : activeQueues.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <IconCalendar size={48} className="text-muted-foreground mb-4" />
                                        <p className="text-lg font-medium">No active queues</p>
                                        <p className="text-sm text-muted-foreground">
                                            {isCustomer ? 'Take a queue ticket to get started' : 'No queues for selected date'}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {activeQueues.map((queue) => {
                                        const progress = progressMap[queue.id];
                                        return (
                                            <div key={queue.id} className="space-y-4">
                                                <QueueCard
                                                    queue={queue}
                                                    currentUser={user}
                                                    onCancel={handleCancel}
                                                    onCall={handleCall}
                                                    onStart={handleStart}
                                                    onComplete={handleComplete}
                                                    onNoShow={handleNoShow}
                                                    onAssign={handleAssign}
                                                    onUpdate={handleUpdate}
                                                    showProgress={isCustomer}
                                                    position={progress?.position_in_queue}
                                                    estimatedWait={progress?.estimated_wait_time}
                                                />
                                                {isCustomer && progress && (
                                                    <QueueProgressTracker progress={progress} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Completed/Cancelled Queues (collapsed) */}
                            {queues.some(q =>
                                q.status === 'completed' || q.status === 'cancelled' || q.status === 'no_show'
                            ) && (
                                    <details className="mt-4">
                                        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                                            View Completed/Cancelled ({queues.filter(q =>
                                                q.status === 'completed' || q.status === 'cancelled' || q.status === 'no_show'
                                            ).length})
                                        </summary>
                                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                                            {queues
                                                .filter(q => q.status === 'completed' || q.status === 'cancelled' || q.status === 'no_show')
                                                .map((queue) => (
                                                    <QueueCard
                                                        key={queue.id}
                                                        queue={queue}
                                                        currentUser={user}
                                                    />
                                                ))}
                                        </div>
                                    </details>
                                )}
                        </div>
                    </div>
                </div>
            </SidebarInset>

            {/* Queue Ticket Form Dialog */}
            <QueueTicketForm
                open={showTicketForm}
                onOpenChange={setShowTicketForm}
                onSuccess={loadQueues}
            />

            {/* Update Queue Dialog */}
            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Queue</DialogTitle>
                        <DialogDescription>Update estimated time and mechanic notes</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="estimated_time">Estimated Time (minutes)</Label>
                            <Input
                                id="estimated_time"
                                type="number"
                                value={estimatedTime}
                                onChange={(e) => setEstimatedTime(e.target.value)}
                                min="0"
                            />
                        </div>
                        <div>
                            <Label htmlFor="mechanic_notes">Mechanic Notes</Label>
                            <Textarea
                                id="mechanic_notes"
                                value={mechanicNotes}
                                onChange={(e) => setMechanicNotes(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>Cancel</Button>
                        <Button onClick={submitUpdate}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
