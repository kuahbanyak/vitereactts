import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
    IconPlus, IconRefresh, IconCalendar, IconTicket,
    IconUsers, IconTool, IconCircleCheck, IconChevronDown,
} from '@tabler/icons-react';
import { toast } from 'sonner';

export function QueuePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [queues, setQueues] = useState<WaitingListEntry[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, ServiceProgress>>({});
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [summary, setSummary] = useState<QueueSummary | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    // Update dialog
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [updateQueueId, setUpdateQueueId] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [mechanicNotes, setMechanicNotes] = useState('');

    const isAdmin = user && hasRole(user, ROLE_NAMES.ADMIN);
    const isMechanic = user && hasRole(user, ROLE_NAMES.MECHANIC);
    const isCustomer = user && hasRole(user, ROLE_NAMES.CUSTOMER);
    const isAdminOrMechanic = isAdmin || isMechanic;

    useEffect(() => { loadQueues(); }, [selectedDate, user]);

    const loadQueues = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let queueData: WaitingListEntry[] = [];
            if (isCustomer) {
                queueData = await waitingListService.getMyQueue();
            } else if (isAdminOrMechanic) {
                // Use admin/mechanic endpoint which returns ALL customers' tickets
                queueData = await waitingListService.getAdminQueueForDate(selectedDate);
            }
            setQueues(queueData);

            if (isAdminOrMechanic) {
                setSummary({
                    total: queueData.length,
                    waiting: queueData.filter(q => q.status === 'waiting').length,
                    called: queueData.filter(q => q.status === 'called').length,
                    in_service: queueData.filter(q => q.status === 'in_service').length,
                    completed: queueData.filter(q => q.status === 'completed').length,
                    cancelled: queueData.filter(q => q.status === 'cancelled').length,
                    no_show: queueData.filter(q => q.status === 'no_show').length,
                });
            }
            await loadProgress(queueData);
        } catch {
            toast.error('Failed to load queue data');
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async (queueData: WaitingListEntry[]) => {
        const progressData: Record<string, ServiceProgress> = {};
        for (const queue of queueData) {
            try { progressData[queue.id] = await waitingListService.getQueueProgress(queue.id); }
            catch { /* skip */ }
        }
        setProgressMap(progressData);
    };

    const handleCancel = async (id: string) => { if (!confirm('Cancel this ticket?')) return; setLoading(true); try { await waitingListService.cancelQueue(id); await loadQueues(); } catch { /* handled */ } finally { setLoading(false); } };
    const handleCall = async (id: string) => { try { await waitingListService.callCustomer(id); loadQueues(); } catch { /* handled */ } };
    const handleStart = async (id: string) => { try { await waitingListService.startService(id); loadQueues(); } catch { /* handled */ } };
    const handleComplete = async (id: string) => { try { await waitingListService.completeService(id); loadQueues(); } catch { /* handled */ } };
    const handleNoShow = async (id: string) => { if (!confirm('Mark as no-show?')) return; try { await waitingListService.markNoShow(id); loadQueues(); } catch { /* handled */ } };
    const handleAssign = async (id: string) => { try { await waitingListService.assignMechanic({ queue_id: id }); loadQueues(); } catch { /* handled */ } };
    const handleUpdate = (id: string) => {
        const q = queues.find(x => x.id === id);
        if (q) { setUpdateQueueId(id); setEstimatedTime(q.estimated_time?.toString() || ''); setMechanicNotes(q.mechanic_notes || ''); setShowUpdateDialog(true); }
    };
    const submitUpdate = async () => {
        try { await waitingListService.updateQueueEstimate(updateQueueId, { estimated_time: estimatedTime ? parseInt(estimatedTime) : undefined, mechanic_notes: mechanicNotes || undefined }); setShowUpdateDialog(false); loadQueues(); }
        catch { /* handled */ }
    };

    const activeQueues = queues.filter(q => q.status !== 'completed' && q.status !== 'cancelled' && q.status !== 'no_show');
    const doneQueues = queues.filter(q => q.status === 'completed' || q.status === 'cancelled' || q.status === 'no_show');

    return (
        <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Queue Management" />

                <div className="flex flex-col gap-4 p-4 lg:p-6">

                    {/* ── Top bar ─────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            {isAdminOrMechanic && (
                                <div className="flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5">
                                    <IconCalendar size={14} className="text-muted-foreground" />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        className="border-0 bg-transparent text-sm focus:outline-none"
                                    />
                                </div>
                            )}
                            <Button variant="outline" size="sm" onClick={loadQueues} disabled={loading} className="h-8 gap-1.5">
                                <IconRefresh size={14} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </Button>
                        </div>
                        {isCustomer && (
                            <Button size="sm" onClick={() => setShowTicketForm(true)} className="h-8 gap-1.5">
                                <IconPlus size={14} /> Take Queue
                            </Button>
                        )}
                    </div>

                    {/* ── Compact stat strip (Admin/Mechanic) ─────────── */}
                    {isAdminOrMechanic && summary && (
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Total', value: summary.total, icon: IconTicket, cls: '' },
                                { label: 'Waiting', value: summary.waiting, icon: IconUsers, cls: 'text-amber-600 dark:text-amber-400' },
                                { label: 'Called', value: summary.called, icon: IconUsers, cls: 'text-blue-600 dark:text-blue-400' },
                                { label: 'In Service', value: summary.in_service, icon: IconTool, cls: 'text-purple-600 dark:text-purple-400' },
                                { label: 'Completed', value: summary.completed, icon: IconCircleCheck, cls: 'text-green-600 dark:text-green-400' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs shadow-sm">
                                    <s.icon size={12} className={s.cls} />
                                    <span className={`font-bold tabular-nums ${s.cls}`}>{s.value}</span>
                                    <span className="text-muted-foreground">{s.label}</span>
                                </div>
                            ))}
                            <Badge variant="outline" className="gap-1 rounded-full text-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                                Live
                            </Badge>
                        </div>
                    )}

                    {/* ── Active Queue List ───────────────────────────── */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <IconRefresh size={20} className="animate-spin" />
                                <p className="text-sm">Loading queues...</p>
                            </div>
                        </div>
                    ) : activeQueues.length === 0 ? (
                        <Card className="border-0 shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-14 gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                                    <IconCalendar size={28} className="text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold">No active queues</p>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {isCustomer ? 'Take a queue ticket to get started' : 'No queues for the selected date'}
                                    </p>
                                </div>
                                {isCustomer && (
                                    <Button size="sm" onClick={() => setShowTicketForm(true)} className="gap-1.5 mt-1">
                                        <IconPlus size={14} /> Book a Service
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        /* Admin: 2-col grid on large. Customer: single col */
                        <div className={isAdminOrMechanic ? 'grid gap-2 md:grid-cols-2' : 'flex flex-col gap-2'}>
                            {activeQueues.map(queue => (
                                <div key={queue.id} className="flex flex-col gap-2">
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
                                        showProgress={!!isCustomer}
                                        position={progressMap[queue.id]?.position_in_queue}
                                        estimatedWait={progressMap[queue.id]?.estimated_wait_time}
                                    />
                                    {isCustomer && progressMap[queue.id] && (
                                        <QueueProgressTracker progress={progressMap[queue.id]} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── History section (collapsible) ──────────────── */}
                    {doneQueues.length > 0 && (
                        <div className="rounded-xl border-0 shadow-sm bg-card overflow-hidden">
                            <button
                                className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                                onClick={() => setShowHistory(v => !v)}
                            >
                                <span className="text-sm font-medium text-muted-foreground">
                                    History · {doneQueues.length} ticket{doneQueues.length !== 1 ? 's' : ''}
                                </span>
                                <IconChevronDown
                                    size={15}
                                    className={`text-muted-foreground transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {showHistory && (
                                <div className={`p-2 grid gap-2 ${isAdminOrMechanic ? 'md:grid-cols-2' : ''} border-t border-border/50`}>
                                    {doneQueues.map(queue => (
                                        <QueueCard key={queue.id} queue={queue} currentUser={user} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </SidebarInset>

            {/* Dialogs */}
            <QueueTicketForm open={showTicketForm} onOpenChange={setShowTicketForm} onSuccess={loadQueues} />

            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Queue Ticket</DialogTitle>
                        <DialogDescription>Set estimated time and add mechanic notes</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-1">
                        <div>
                            <Label htmlFor="estimated_time" className="text-sm">Estimated Time (minutes)</Label>
                            <Input id="estimated_time" type="number" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} min="0" className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="mechanic_notes" className="text-sm">Mechanic Notes</Label>
                            <Textarea id="mechanic_notes" value={mechanicNotes} onChange={e => setMechanicNotes(e.target.value)} rows={3} className="mt-1.5" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setShowUpdateDialog(false)}>Cancel</Button>
                        <Button size="sm" onClick={submitUpdate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
