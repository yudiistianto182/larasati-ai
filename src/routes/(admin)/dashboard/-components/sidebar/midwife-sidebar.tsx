import { Link } from "@tanstack/react-router";

import { Command } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { rootUser } from "@/data/users";
import { mainDashboardSidebarItems } from "@/navigation/sidebar/main-dashboard-sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain } from "@/routes/(main)/dashboard/-components/sidebar/nav-main";
import { NavUser } from "@/routes/(main)/dashboard/-components/sidebar/nav-user";
import { SupportCard } from "@/routes/(main)/dashboard/-components/sidebar/support-card";

export function MidwifeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.values.sidebar_variant,
      sidebarCollapsible: s.values.sidebar_collapsible,
      isSynced: s.isSynced,
    })),
  );

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/dashboard/admin-default" />}>
              <Command />
              <span className="font-semibold text-base">{APP_CONFIG.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainDashboardSidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <SupportCard />
        <NavUser user={rootUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
