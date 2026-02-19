import * as React from "react"
import {
  IconDashboard,
  IconDatabase,
  IconInnerShadowTop,
  IconTicket,
} from "@tabler/icons-react"

import { useAuth } from '@/auth/use-auth';
import { ROLE_NAMES } from '@/config/roles';

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();
  const navItems = [
    { title: 'Dashboard', url: '/dashboard', icon: IconDashboard },
    { title: 'Queue', url: '/dashboard/queue', icon: IconTicket },
  ];
  if (user?.role?.toLowerCase() === ROLE_NAMES.ADMIN.toLowerCase()) navItems.push({ title: 'Users', url: '/dashboard/users', icon: IconDatabase });
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading menu...</div>
        ) : (
          <NavMain items={navItems} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
