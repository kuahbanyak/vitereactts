import * as React from "react"
import {
  IconDashboard,
  IconDatabase,
  IconInnerShadowTop,
} from "@tabler/icons-react"

import { useAuth } from '@/auth/use-auth';

import { NavDocuments } from "@/components/nav-documents"
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

const documents = [
  { name: 'Data Library', url: '#', icon: IconDatabase }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();
  const navItems = [ { title: 'Dashboard', url: '/dashboard', icon: IconDashboard } ];
  if (user?.role === 'admin') navItems.push({ title: 'Users', url: '/dashboard/users', icon: IconDatabase });
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
          <>
            <NavMain items={navItems} />
            <NavDocuments items={documents} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
