import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardTicketWidget } from '@/components/dashboard-ticket-widget';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/auth/use-auth';
import { hasRole } from '@/auth/types';
import { ROLE_NAMES } from '@/config/roles';
import { waitingListService, vehicleService } from '@/services/waiting-list.service';
import type { Vehicle, WaitingListEntry } from '@/types/waiting-list.types';
import {
    IconCar, IconCalendarCheck, IconHistory, IconSparkles,
    IconArrowRight, IconClockHour4, IconCircleCheck,
} from '@tabler/icons-react';

import data from './data.json';

// ── Greeting helper ──────────────────────────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

// ── Customer Quick Stats ─────────────────────────────────────────────────────
function CustomerQuickStats({ userId }: { userId: string }) {
    const [stats, setStats] = useState({ total: 0, completed: 0, vehicles: 0, pending: 0 });

    useEffect(() => {
        async function load() {
            try {
                const [tickets, vehicles] = await Promise.all([
                    waitingListService.getMyQueue(),
                    vehicleService.getMyVehicles(),
                ]);
                setStats({
                    total: tickets.length,
                    completed: tickets.filter((t: WaitingListEntry) => t.status === 'completed').length,
                    vehicles: vehicles.length,
                    pending: tickets.filter((t: WaitingListEntry) =>
                        t.status === 'waiting' || t.status === 'called' || t.status === 'in_service'
                    ).length,
                });
            } catch { /* silent */ }
        }
        load();
    }, [userId]);

    const items = [
        { label: 'Total Services', value: stats.total, icon: IconHistory, color: 'text-foreground' },
        { label: 'Completed', value: stats.completed, icon: IconCircleCheck, color: 'text-green-600 dark:text-green-400' },
        { label: 'My Vehicles', value: stats.vehicles, icon: IconCar, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'In Progress', value: stats.pending, icon: IconClockHour4, color: 'text-amber-600 dark:text-amber-400' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map(s => (
                <Card key={s.label} className="border-0 shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <s.icon size={18} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-2xl font-extrabold tabular-nums leading-none ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ── Customer Info Panel (right column) ───────────────────────────────────────
function CustomerInfoPanel({ userId }: { userId: string }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    useEffect(() => {
        vehicleService.getMyVehicles().then(setVehicles).catch(() => { });
    }, [userId]);

    return (
        <div className="flex flex-col gap-4">
            {/* My Vehicles */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <IconCar size={15} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm font-semibold">My Vehicles</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{vehicles.length}</Badge>
                    </div>

                    {vehicles.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-4 text-center">
                            <p className="text-sm text-muted-foreground">No vehicles registered yet.</p>
                            <Button size="sm" variant="outline" asChild>
                                <Link to="/dashboard/queue">Add Vehicle</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {vehicles.slice(0, 3).map(v => (
                                <div key={v.id} className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                                        <IconCar size={15} className="text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{v.brand} {v.model}</p>
                                        <p className="text-xs text-muted-foreground">{v.license_plate} · {v.year}</p>
                                    </div>
                                </div>
                            ))}
                            {vehicles.length > 3 && (
                                <p className="text-xs text-muted-foreground text-center pt-1">
                                    +{vehicles.length - 3} more vehicle{vehicles.length - 3 !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                    <p className="text-sm font-semibold mb-3">Quick Actions</p>
                    <div className="space-y-1.5">
                        {[
                            { label: 'View Queue Status', icon: IconClockHour4, to: '/dashboard/queue', color: 'text-amber-500' },
                            { label: 'Service History', icon: IconHistory, to: '/dashboard/queue', color: 'text-blue-500' },
                            { label: 'Book a Service', icon: IconCalendarCheck, to: '/dashboard/queue', color: 'text-green-500' },
                        ].map(link => (
                            <Link key={link.label} to={link.to}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors group"
                            >
                                <link.icon size={16} className={link.color} />
                                <span className="text-sm flex-1">{link.label}</span>
                                <IconArrowRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Service Tip */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/8 to-amber-50/20 dark:to-amber-900/10">
                <CardContent className="p-5">
                    <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                            <IconSparkles size={15} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold mb-0.5">Service Tip</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Regular oil changes every 5,000 km extend your engine life by up to 40%.
                                Book early to get your preferred slot!
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ── Customer Full Dashboard ───────────────────────────────────────────────────
import type { User } from '@/auth/types';

function CustomerDashboard({ userName, userId, user }: { userName: string; userId: string; user: User }) {
    return (
        <div className="flex flex-col gap-5 px-4 py-5 lg:px-6 lg:py-6">
            {/* ── Greeting header ── */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                        {getGreeting()}
                    </p>
                    <h1 className="text-2xl font-bold mt-0.5">
                        {userName} 👋
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Here's your vehicle service overview
                    </p>
                </div>
                <Button size="sm" variant="outline" asChild className="hidden sm:flex">
                    <Link to="/dashboard/queue">
                        View All Queue <IconArrowRight size={14} className="ml-1" />
                    </Link>
                </Button>
            </div>

            {/* ── Quick stats ── */}
            <CustomerQuickStats userId={userId} />

            {/* ── Main 2-column grid ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                {/* Left: ticket widget (3/5) */}
                <div className="lg:col-span-3">
                    <DashboardTicketWidget currentUser={user} />
                </div>
                {/* Right: info panel (2/5) */}
                <div className="lg:col-span-2">
                    <CustomerInfoPanel userId={userId} />
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function Page() {
    const { user } = useAuth();
    const isCustomer = user && hasRole(user, ROLE_NAMES.CUSTOMER);

    const firstName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': 'calc(var(--spacing) * 72)',
                    '--header-height': 'calc(var(--spacing) * 12)',
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title={isCustomer ? `Welcome, ${firstName}` : 'Dashboard'} />

                {isCustomer && user ? (
                    <CustomerDashboard
                        userName={firstName}
                        userId={user.id}
                        user={user}
                    />
                ) : (
                    /* Admin / Mechanic layout */
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                <SectionCards currentUser={user} />
                                <div className="px-4 lg:px-6">
                                    <ChartAreaInteractive />
                                </div>
                                <DataTable data={data} />
                            </div>
                        </div>
                    </div>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
