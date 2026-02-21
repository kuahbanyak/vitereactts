"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup, ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { analyticsService, type VisitorStats, type VisitorStatsPeriod } from "@/services/analytics.service"
import { IconUsers, IconUserPlus, IconRepeat, IconTicket, IconChartBar, IconRefresh } from "@tabler/icons-react"

export const description = "An interactive area chart"

const chartConfig = {
  visitors: { label: "Visitors" },
  visitor_count: { label: "Total Visitors", color: "var(--primary)" },
  new_customers: { label: "New Customers", color: "var(--chart-2)" },
} satisfies ChartConfig

// Colour palette for service category bars
const PALETTE = [
  "bg-primary", "bg-blue-500", "bg-amber-500",
  "bg-green-500", "bg-purple-500", "bg-rose-500", "bg-cyan-500",
]

const RANGE_TO_PERIOD: Record<string, VisitorStatsPeriod> = {
  "90d": "3months",
  "30d": "30days",
  "7d": "7days",
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [stats, setStats] = React.useState<VisitorStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  React.useEffect(() => {
    setLoading(true)
    const period = RANGE_TO_PERIOD[timeRange] ?? "30days"
    analyticsService.getVisitorStats(period)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [timeRange])

  const chartData = (stats?.by_date ?? []).map(d => ({
    date: d.date,
    visitor_count: d.visitor_count,
    new_customers: d.new_customers,
  }))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Visitor Statistics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {stats
              ? `${stats.total_visitors.toLocaleString()} total · ${stats.new_customers} new · ${stats.returning_customers} returning`
              : "Loading…"}
          </span>
          <span className="@[540px]/card:hidden">Visitor trend</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={v => v && setTimeRange(v)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
              <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-2 sm:px-6">
        {/* ── Key metric tiles ── */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
            {[
              { label: "Total Visitors", value: stats.total_visitors, icon: IconUsers, color: "text-primary", bg: "bg-primary/10" },
              { label: "New Customers", value: stats.new_customers, icon: IconUserPlus, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
              { label: "Returning", value: stats.returning_customers, icon: IconRepeat, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Total Tickets", value: stats.total_tickets, icon: IconTicket, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl ${s.bg} px-4 py-3 flex items-center gap-3`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/60">
                  <s.icon size={18} className={s.color} />
                </div>
                <div>
                  <p className={`text-2xl font-extrabold tabular-nums leading-none ${s.color}`}>
                    {s.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Area Chart ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <IconRefresh size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-visitor_count)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-visitor_count)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-new_customers)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-new_customers)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="new_customers"
                type="natural"
                fill="url(#fillNew)"
                stroke="var(--color-new_customers)"
                stackId="a"
              />
              <Area
                dataKey="visitor_count"
                type="natural"
                fill="url(#fillVisitors)"
                stroke="var(--color-visitor_count)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <IconUsers size={28} className="opacity-30" />
            <p className="text-sm">No data available for this period.</p>
          </div>
        )}

        {/* ── Service category breakdown ── */}
        {stats && stats.by_service_category.length > 0 && (
          <div className="mt-5 pt-4 border-t">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <IconChartBar size={12} />
              By Service Category
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {stats.by_service_category.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${PALETTE[i % PALETTE.length]}`} />
                      <span className="font-medium">{cat.category}</span>
                    </div>
                    <span className="text-muted-foreground tabular-nums">
                      {cat.visitor_count} visitors · {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${PALETTE[i % PALETTE.length]} transition-all duration-700`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
