import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardTicketWidget } from "@/components/dashboard-ticket-widget"
import { hasRole, type User } from "@/auth/types"
import { ROLE_NAMES } from "@/config/roles"

interface SectionCardsProps {
  currentUser?: User | null;
}

export function SectionCards({ currentUser }: SectionCardsProps) {
  const isCustomer = currentUser && hasRole(currentUser, ROLE_NAMES.CUSTOMER);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      {/* Ticket Widget — takes up first column (or full width on mobile) */}
      {currentUser && (
        <div className={isCustomer ? "col-span-full @xl/main:col-span-1" : "col-span-full"}>
          <DashboardTicketWidget currentUser={currentUser} />
        </div>
      )}

      {/* Stat cards — only shown to admin/mechanic or if no user */}
      {!isCustomer && (
        <>
          <Card className="@container/card *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card bg-gradient-to-t shadow-xs">
            <CardHeader>
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                $1,250.00
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Trending up this month <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">Visitors for the last 6 months</div>
            </CardFooter>
          </Card>
          <Card className="@container/card *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card bg-gradient-to-t shadow-xs">
            <CardHeader>
              <CardDescription>New Customers</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                1,234
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingDown />
                  -20%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Down 20% this period <IconTrendingDown className="size-4" />
              </div>
              <div className="text-muted-foreground">Acquisition needs attention</div>
            </CardFooter>
          </Card>
          <Card className="@container/card *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card bg-gradient-to-t shadow-xs">
            <CardHeader>
              <CardDescription>Active Accounts</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                45,678
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Strong user retention <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">Engagement exceed targets</div>
            </CardFooter>
          </Card>
          <Card className="@container/card *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card bg-gradient-to-t shadow-xs">
            <CardHeader>
              <CardDescription>Growth Rate</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                4.5%
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                  +4.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Steady performance increase <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">Meets growth projections</div>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}
