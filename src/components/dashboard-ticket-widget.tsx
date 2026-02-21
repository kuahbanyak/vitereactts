import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QueueTicketForm } from '@/components/queue-ticket-form';
import { waitingListService } from '@/services/waiting-list.service';
import { hasRole, type User } from '@/auth/types';
import { ROLE_NAMES } from '@/config/roles';
import type { WaitingListEntry, ServiceProgress, AdminTicketCount } from '@/types/waiting-list.types';
import {
    IconTicket,
    IconCar,
    IconClock,
    IconCalendar,
    IconRefresh,
    IconChevronDown,
    IconCircleCheck,
    IconCircleX,
    IconArrowRight,
    IconUsers,
    IconTool,
    IconSparkles,
    IconAlertCircle,
    IconChecks,
    IconCalendarStats,
} from '@tabler/icons-react';

interface DashboardTicketWidgetProps {
    currentUser: User | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusLabel(s: string) {
    return ({ waiting: 'Waiting', called: 'Called', in_service: 'In Service', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No Show' } as any)[s] ?? s;
}

// ── Step Progress Bar ────────────────────────────────────────────────────────
const STEPS = [
    { key: 'waiting', label: 'Checked In', icon: IconTicket },
    { key: 'called', label: 'Called', icon: IconAlertCircle },
    { key: 'in_service', label: 'In Service', icon: IconTool },
    { key: 'completed', label: 'Done', icon: IconChecks },
] as const;

function StepProgress({ status }: { status: string }) {
    const activeIdx = STEPS.findIndex(s => s.key === status);
    return (
        <div className="flex items-center gap-0 w-full">
            {STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const done = i < activeIdx;
                const active = i === activeIdx;
                return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                        {/* Circle */}
                        <div className="flex flex-col items-center gap-1">
                            <div className={`
                                flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500
                                ${done ? 'border-primary bg-primary text-primary-foreground' : ''}
                                ${active ? 'border-primary bg-primary/15 text-primary ring-4 ring-primary/20 scale-110' : ''}
                                ${!done && !active ? 'border-border bg-muted text-muted-foreground' : ''}
                            `}>
                                {done ? <IconCircleCheck size={18} /> : <StepIcon size={16} />}
                            </div>
                            <span className={`text-[10px] font-medium text-center leading-tight w-14
                                ${active ? 'text-primary' : done ? 'text-muted-foreground' : 'text-muted-foreground/50'}
                            `}>{step.label}</span>
                        </div>
                        {/* Connector line */}
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 mb-5 rounded-full transition-all duration-700
                                ${i < activeIdx ? 'bg-primary' : 'bg-border'}
                            `} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── History Row ──────────────────────────────────────────────────────────────
function HistoryRow({ ticket }: { ticket: WaitingListEntry }) {
    const isCompleted = ticket.status === 'completed';
    const isCancelled = ticket.status === 'cancelled' || ticket.status === 'no_show';

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/60 transition-colors group animate-in-up">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0
                    ${isCompleted ? 'bg-green-100 dark:bg-green-900/30' : ''}
                    ${isCancelled ? 'bg-red-100 dark:bg-red-900/30' : ''}
                `}>
                    {isCompleted && <IconCircleCheck size={16} className="text-green-600 dark:text-green-400" />}
                    {isCancelled && <IconCircleX size={16} className="text-red-500" />}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ticket.service_type}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ticket.service_date)}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : ''}
                    ${isCancelled ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' : ''}
                `}>{statusLabel(ticket.status)}</span>
                <IconArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}

// ── Customer Widget ──────────────────────────────────────────────────────────
function CustomerTicketWidget({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTicket, setActiveTicket] = useState<WaitingListEntry | null>(null);
    const [history, setHistory] = useState<WaitingListEntry[]>([]);
    const [progress, setProgress] = useState<ServiceProgress | null>(null);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const all = await waitingListService.getMyQueue();
            const active = all.find(q =>
                q.status === 'waiting' || q.status === 'called' || q.status === 'in_service'
            ) ?? null;
            const past = all
                .filter(q => q.status === 'completed' || q.status === 'cancelled' || q.status === 'no_show')
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5);
            setActiveTicket(active);
            setHistory(past);
            if (active) {
                try { setProgress(await waitingListService.getQueueProgress(active.id)); }
                catch { setProgress(null); }
            } else {
                setProgress(null);
            }
        } catch { /* silent */ }
        finally { setLoading(false); setRefreshing(false); }
    }, [userId]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleRefresh = () => { setRefreshing(true); loadData(); };
    const handleCancel = async () => {
        if (!activeTicket || !confirm('Are you sure you want to cancel your ticket?')) return;
        setCancelling(true);
        try { await waitingListService.cancelQueue(activeTicket.id); await loadData(); }
        catch { /* handled by service */ }
        finally { setCancelling(false); }
    };

    if (loading) {
        return (
            <Card className="border-0 shadow-sm">
                <CardContent className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <IconRefresh size={22} className="animate-spin" />
                        <p className="text-sm">Loading your service status...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4 animate-in-up">

            {/* ══ Active Ticket Card ══════════════════════════════════════ */}
            {activeTicket ? (
                <Card className="overflow-hidden border-0 shadow-md">
                    {/* Amber gradient header bar */}
                    <div className="bg-gradient-to-r from-primary via-primary/90 to-amber-400 px-5 py-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
                                    Your Active Ticket
                                </p>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-4xl font-extrabold text-primary-foreground tracking-tight">
                                        #{activeTicket.queue_number}
                                    </span>
                                    <span className="text-primary-foreground/80 font-medium text-sm truncate max-w-[180px]">
                                        {activeTicket.service_type}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <IconRefresh size={15} className={`text-primary-foreground ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <CardContent className="p-5 space-y-5">
                        {/* Step Progress */}
                        <StepProgress status={activeTicket.status} />

                        <Separator />

                        {/* Queue stats */}
                        {progress && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-primary/8 dark:bg-primary/15 flex items-center gap-3 px-4 py-3">
                                    <IconUsers size={18} className="text-primary shrink-0" />
                                    <div>
                                        <p className="text-xl font-bold tabular-nums">{progress.position_in_queue}</p>
                                        <p className="text-xs text-muted-foreground">ahead of you</p>
                                    </div>
                                </div>
                                {progress.estimated_wait_time > 0 && (
                                    <div className="rounded-xl bg-primary/8 dark:bg-primary/15 flex items-center gap-3 px-4 py-3">
                                        <IconClock size={18} className="text-primary shrink-0" />
                                        <div>
                                            <p className="text-xl font-bold tabular-nums">~{progress.estimated_wait_time}m</p>
                                            <p className="text-xs text-muted-foreground">estimated wait</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Details row */}
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {activeTicket.vehicle && (
                                <span className="flex items-center gap-1.5">
                                    <IconCar size={14} />
                                    {activeTicket.vehicle.brand} {activeTicket.vehicle.model} · {activeTicket.vehicle.license_plate}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <IconCalendar size={14} />
                                {formatDate(activeTicket.service_date)}
                            </span>
                            {activeTicket.mechanic_name && (
                                <span className="flex items-center gap-1.5">
                                    <IconTool size={14} />
                                    {activeTicket.mechanic_name}
                                </span>
                            )}
                        </div>

                        {/* Action row */}
                        <div className="flex gap-2 pt-1">
                            {(activeTicket.status === 'waiting' || activeTicket.status === 'called') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                >
                                    {cancelling ? 'Cancelling...' : 'Cancel Ticket'}
                                </Button>
                            )}
                            <Button size="sm" className="ml-auto gap-1.5" asChild>
                                <Link to="/dashboard/queue">
                                    View Full Queue <IconArrowRight size={14} />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* ══ CTA Hero Card ════════════════════════════════════════ */
                <Card className="overflow-hidden border-0 shadow-md">
                    {/* Background pattern */}
                    <div className="relative bg-gradient-to-br from-primary/10 via-background to-amber-50/30 dark:to-amber-900/10 px-6 py-8">
                        {/* Decorative circles */}
                        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5" />
                        <div className="absolute -right-2 bottom-0 h-20 w-20 rounded-full bg-primary/8" />

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            {/* Icon */}
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/15 ring-8 ring-primary/5">
                                <IconCar size={32} className="text-primary" />
                            </div>

                            <div className="flex-1">
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
                                    Car Service Center
                                </p>
                                <h2 className="text-xl font-bold leading-snug">
                                    Ready to book your<br /> service slot?
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Get a queue number and track your car's status in real-time.
                                </p>
                            </div>

                            <Button
                                size="lg"
                                onClick={() => setShowTicketForm(true)}
                                className="shrink-0 gap-2 shadow-md hover:shadow-primary/30 transition-shadow font-semibold"
                            >
                                <IconSparkles size={16} />
                                Book Now
                            </Button>
                        </div>

                        {/* Feature pills */}
                        <div className="relative mt-5 flex flex-wrap gap-2">
                            {[
                                { icon: IconTicket, text: 'Queue ticket' },
                                { icon: IconClock, text: 'Real-time wait' },
                                { icon: IconTool, text: 'Mechanic assigned' },
                                { icon: IconChecks, text: 'Service history' },
                            ].map(f => (
                                <span key={f.text} className="flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                                    <f.icon size={12} className="text-primary" />
                                    {f.text}
                                </span>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* ══ Ticket History ══════════════════════════════════════════ */}
            {history.length > 0 && (
                <Card className="border-0 shadow-sm overflow-hidden">
                    <button
                        className="flex w-full items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
                        onClick={() => setShowHistory(v => !v)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <IconCalendar size={15} className="text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold">Service History</p>
                                <p className="text-xs text-muted-foreground">{history.length} past service{history.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-muted transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}>
                            <IconChevronDown size={14} className="text-muted-foreground" />
                        </div>
                    </button>

                    {showHistory && (
                        <div className="px-3 pb-3 space-y-0.5 animate-in-up">
                            <Separator className="mb-2" />
                            {history.map(ticket => (
                                <HistoryRow key={ticket.id} ticket={ticket} />
                            ))}
                            <div className="pt-2">
                                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground" asChild>
                                    <Link to="/dashboard/queue">
                                        View full service history <IconArrowRight size={12} className="ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            <QueueTicketForm open={showTicketForm} onOpenChange={setShowTicketForm} onSuccess={loadData} />
        </div>
    );
}

// ── Admin / Mechanic Stats ───────────────────────────────────────────────────
function StaffQueueWidget() {
    const [loading, setLoading] = useState(true);
    const [weeklyCount, setWeeklyCount] = useState<AdminTicketCount | null>(null);
    const [todayProgress, setTodayProgress] = useState<import('@/types/waiting-list.types').AllProgressItem[]>([]);
    const [showAll, setShowAll] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        async function load() {
            try {
                const [countResult, progressResult] = await Promise.allSettled([
                    waitingListService.getAdminTicketCount(),
                    waitingListService.getAllProgress(today),
                ]);
                if (countResult.status === 'fulfilled') setWeeklyCount(countResult.value);
                if (progressResult.status === 'fulfilled') setTodayProgress(progressResult.value);
            } catch { /* silent */ }
            finally { setLoading(false); }
        }
        load();
    }, [today]);

    const items = weeklyCount ? [
        { label: 'Total Tickets', value: weeklyCount.total_tickets, color: 'text-foreground', bg: 'bg-muted/60' },
        { label: 'Active', value: weeklyCount.active_tickets, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Completed', value: weeklyCount.completed_tickets, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Cancelled', value: weeklyCount.canceled_tickets, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
        { label: 'Slots Left', value: weeklyCount.remaining_tickets, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    ] : [];

    const STATUS_META: Record<string, { label: string; cls: string }> = {
        waiting: { label: 'Waiting', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
        called: { label: 'Called', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
        in_service: { label: 'In Service', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
        completed: { label: 'Completed', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
        canceled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' },
        cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' },
        no_show: { label: 'No Show', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-300' },
    };

    const visibleTickets = showAll ? todayProgress : todayProgress.slice(0, 5);

    return (
        <Card className="border-0 shadow-sm col-span-full">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Weekly System</p>
                        <h3 className="text-base font-bold">Queue Overview</h3>
                    </div>
                    <Badge variant="outline" className="text-xs gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                        Live
                    </Badge>
                </div>
                {loading ? (
                    <div className="flex justify-center py-6">
                        <IconRefresh size={18} className="animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* ── Ticket count stats grid ── */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {items.map(s => (
                                <div key={s.label} className={`rounded-xl ${s.bg} px-4 py-3`}>
                                    <p className={`text-3xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Status message from API */}
                        {weeklyCount !== null && (
                            <div className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-muted-foreground">
                                <IconCalendarStats size={14} className="text-primary shrink-0" />
                                <span className="truncate">{weeklyCount.message}</span>
                            </div>
                        )}

                        {/* ── Today's queue progress list ── */}
                        {todayProgress.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                    Today's Queue · {todayProgress.length} ticket{todayProgress.length !== 1 ? 's' : ''}
                                </p>
                                <div className="space-y-1">
                                    {visibleTickets.map(ticket => {
                                        const meta = STATUS_META[ticket.status] ?? { label: ticket.status, cls: 'bg-muted text-muted-foreground' };
                                        return (
                                            <div key={ticket.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm tabular-nums">
                                                    {ticket.queue_number}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {ticket.customer_name ?? 'Customer'}
                                                        {ticket.license_plate && (
                                                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                                                                · {ticket.vehicle_brand} {ticket.vehicle_model} ({ticket.license_plate})
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">{ticket.service_type}</p>
                                                </div>
                                                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>
                                                    {meta.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {todayProgress.length > 5 && (
                                    <button
                                        className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                                        onClick={() => setShowAll(v => !v)}
                                    >
                                        <IconChevronDown size={13} className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
                                        {showAll ? 'Show less' : `Show ${todayProgress.length - 5} more`}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
                <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
                        <Link to="/dashboard/queue">
                            Manage Queue <IconArrowRight size={12} />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Export ───────────────────────────────────────────────────────────────────
export function DashboardTicketWidget({ currentUser }: DashboardTicketWidgetProps) {
    if (!currentUser) return null;
    if (hasRole(currentUser, ROLE_NAMES.CUSTOMER)) {
        return <CustomerTicketWidget userId={currentUser.id} />;
    }
    return <StaffQueueWidget />;
}
