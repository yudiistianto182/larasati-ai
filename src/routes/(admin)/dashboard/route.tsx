import * as React from "react";
import type { CSSProperties } from "react";

import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { users } from "@/data/users";
import { cn } from "@/lib/utils";
import { getDashboardLayout } from "@/server/server-actions";
import { isUserAdmin, getAuthUser, getAuthToken } from "@/lib/api/api-helper";

import { AccountSwitcher } from "@/routes/(main)/dashboard/-components/header/account-switcher";
import { GitHubRepositoriesMenu } from "@/routes/(main)/dashboard/-components/header/github-repositories-menu";
import { LayoutControls } from "@/routes/(main)/dashboard/-components/header/layout-controls";
import { SearchDialog } from "@/routes/(main)/dashboard/-components/header/search-dialog";
import { ThemeSwitcher } from "@/routes/(main)/dashboard/-components/header/theme-switcher";
import { MidwifeSidebar } from "./-components/sidebar/midwife-sidebar";

export const Route = createFileRoute("/(admin)/dashboard")({
  loader: () => getDashboardLayout(),
  component: MidwifeLayout,
});

function MidwifeLayout() {
  const { defaultOpen, variant, collapsible } = Route.useLoaderData();

  const [authChecked, setAuthChecked] = React.useState(false);
  const [hasAdminAccess, setHasAdminAccess] = React.useState(false);

  React.useEffect(() => {
    // Jalankan pengecekan otentikasi dan hak akses admin di sisi client
    const token = getAuthToken();
    const admin = isUserAdmin();

    if (!token || !admin) {
      setHasAdminAccess(false);
    } else {
      setHasAdminAccess(true);
    }
    setAuthChecked(true);
  }, []);

  // Jika pengecekan selesai dan bukan admin, tampilkan layar Access Denied
  if (authChecked && !hasAdminAccess) {
    const user = getAuthUser();
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 text-foreground">
        <div className="flex max-w-md flex-col items-center text-center gap-4 rounded-3xl border border-destructive/30 bg-destructive/5 p-8 shadow-2xl">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/20 shadow-md">
            <ShieldAlert className="size-8" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-serif font-black text-foreground">
              Akses Khusus Administrator
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Halaman Dashboard hanya dapat diakses oleh akun dengan peran <strong>Administrator</strong> atau <strong>Root</strong>.
              {user ? (
                <span className="block mt-2 font-mono text-[11px] text-foreground bg-muted p-1.5 rounded-lg border">
                  Akun: <strong>{user.user_name}</strong> &bull; Role: <strong>{user.role_name}</strong>
                </span>
              ) : (
                <span className="block mt-2 text-[11px] text-muted-foreground">
                  Anda belum melakukan autentikasi ke sistem.
                </span>
              )}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 mt-2">
            <Button
              className="w-full gap-2 rounded-xl text-xs font-semibold"
              nativeButton={false}
              render={<Link to="/lomba" search={{ lombaId: undefined }} />}
            >
              <ArrowLeft className="size-4" />
              <span>Kembali ke Halaman Lomba</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 68)",
        } as CSSProperties
      }
    >
      <MidwifeSidebar variant={variant} collapsible={collapsible} />
      <SidebarInset
        className={cn(
          "[html[data-content-layout=centered]_&>*]:mx-auto",
          "[html[data-content-layout=centered]_&>*]:w-full",
          "[html[data-content-layout=centered]_&>*]:max-w-screen-2xl",
          "peer-data-[variant=inset]:border",
          "[--dashboard-header-height:--spacing(12)]",
          "min-w-0 overflow-x-clip",
        )}
      >
        <header
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            // Handle sticky navbar style with conditional classes so blur, background, z-index, and rounded corners remain consistent across all SidebarVariant layouts.
            "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
          )}
        >
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
              />
              <SearchDialog />
            </div>
            <div className="flex items-center gap-2">
              <LayoutControls />
              <ThemeSwitcher />
              <GitHubRepositoriesMenu />
              <AccountSwitcher users={users} />
            </div>
          </div>
        </header>
        {/* Pages can set data-content-padding="false" to render full-bleed app layouts. */}
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 has-data-[content-padding=false]:p-0 md:p-6 md:has-data-[content-padding=false]:p-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
