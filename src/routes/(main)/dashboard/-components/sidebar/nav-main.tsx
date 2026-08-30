import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarPlus,
  ChevronRight,
  Database,
  FilePlus,
  FileText,
  FolderPlus,
  MailIcon,
  PlusCircle,
  PlusCircleIcon,
  Radio,
  Trophy,
  Tv,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type {
  AppPath,
  NavBadge,
  NavGroup,
  NavMainItem,
  NavMainLinkItem,
  NavMainParentItem,
} from "@/navigation/sidebar/sidebar-items";

interface NavMainProps {
  readonly items: readonly NavGroup[];
}

interface NavItemProps {
  readonly item: NavMainItem;
  readonly isItemActive: (item: NavMainItem) => boolean;
  readonly isSubItemActive: (url: AppPath) => boolean;
  readonly isSubmenuOpen: (item: NavMainParentItem) => boolean;
}

interface NavLinkItemProps {
  readonly item: NavMainLinkItem;
  readonly isActive: boolean;
  readonly showIconFallback: boolean;
}

interface NavLinkIconProps {
  readonly item: NavMainLinkItem;
  readonly showFallback: boolean;
}

interface NavDropdownItemProps {
  readonly item: NavMainParentItem;
  readonly isActive: boolean;
  readonly isSubItemActive: (url: AppPath) => boolean;
}

interface NavCollapsibleItemProps {
  readonly item: NavMainParentItem;
  readonly isActive: boolean;
  readonly defaultOpen: boolean;
  readonly isSubItemActive: (url: AppPath) => boolean;
}

function CollapsedIconFallback({ title }: { title: string }) {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-xs font-medium text-[10px] outline">
      {title.slice(0, 1)}
    </span>
  );
}

function hasSubItems(item: NavMainItem): item is NavMainParentItem {
  return Boolean(item.subItems?.length);
}

export function NavMain({ items }: NavMainProps) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [quickCreateOpen, setQuickCreateOpen] = React.useState(false);
  const navigate = useNavigate();

  const isItemActive = (item: NavMainItem) => {
    if (hasSubItems(item)) {
      return item.subItems.some((sub) => path.startsWith(sub.url));
    }

    return path === item.url;
  };

  const isSubItemActive = (url: AppPath) => {
    return path === url;
  };

  const isSubmenuOpen = (item: NavMainParentItem) => {
    return item.subItems.some((sub) => path.startsWith(sub.url));
  };

  const handleSelectQuickAction = (url: string) => {
    setQuickCreateOpen(false);
    void navigate({ to: url as any });
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                onClick={() => setQuickCreateOpen(true)}
                tooltip="Quick Action"
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                <PlusCircleIcon />
                <span>Quick Action</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
                nativeButton={false}
                render={<Link to="/mail" />}
              >
                <MailIcon />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Quick Create Command Dialog Modal */}
      <CommandDialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
        <Command>
          <CommandInput placeholder="Ketik aksi tambah cepat (Kasus, Lomba, Pasien, Periode)..." />
          <CommandList>
            <CommandEmpty>Aksi tidak ditemukan.</CommandEmpty>

            {/* Group 1: Tambah */}
            <CommandGroup heading="Tambah Baru">
              <CommandItem
                onSelect={() => handleSelectQuickAction("/dashboard/master/kasus/tambah")}
                className="gap-2.5 py-2.5 cursor-pointer"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <FilePlus className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-foreground">Tambah Kasus Klinis Baru</span>
                  <span className="text-[11px] text-muted-foreground">Form 4-Step Wizard Soal Klinis & AI Trigger</span>
                </div>
              </CommandItem>

              <CommandItem
                onSelect={() => handleSelectQuickAction("/dashboard/contest/tambah")}
                className="gap-2.5 py-2.5 cursor-pointer"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <Trophy className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-foreground">Buat Lomba / Kontes Baru</span>
                  <span className="text-[11px] text-muted-foreground">Wizard Konfigurasi Tim, Kasus & Aturan Ujian</span>
                </div>
              </CommandItem>

              <CommandItem
                onSelect={() => handleSelectQuickAction("/dashboard/master/pasien?action=create")}
                className="gap-2.5 py-2.5 cursor-pointer"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600">
                  <UserPlus className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-foreground">Tambah Subjek Pasien Baru</span>
                  <span className="text-[11px] text-muted-foreground">Profil Pasien dengan Tanggal Lahir & Atribut Dinamis</span>
                </div>
              </CommandItem>

              <CommandItem
                onSelect={() => handleSelectQuickAction("/dashboard/master/periode")}
                className="gap-2.5 py-2.5 cursor-pointer"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                  <CalendarPlus className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-foreground">Tambah / Kelola Periode</span>
                  <span className="text-[11px] text-muted-foreground">Master Periode Pelaksanaan Uji Kompetensi</span>
                </div>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Group 2: Kasus */}
            <CommandGroup heading="Kasus">
              <CommandItem
                onSelect={() => handleSelectQuickAction("/dashboard/master/kasus")}
                className="gap-2.5 py-2 cursor-pointer"
              >
                <Database className="size-4 text-primary" />
                <span className="text-xs">Lihat Seluruh Daftar Kasus</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelectQuickAction("/dashboard/master/kasus/tambah")}
                className="gap-2.5 py-2 cursor-pointer"
              >
                <PlusCircle className="size-4 text-blue-500" />
                <span className="text-xs">Buat Kasus Baru (Wizard)</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Group 3: Lomba */}
            <CommandGroup heading="Lomba">
              <CommandItem
                onSelect={() => handleSelectQuickAction("/dashboard/contest")}
                className="gap-2.5 py-2 cursor-pointer"
              >
                <Trophy className="size-4 text-amber-500" />
                <span className="text-xs">Daftar Lomba Aktif</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelectQuickAction("/dashboard/contest/tambah")}
                className="gap-2.5 py-2 cursor-pointer"
              >
                <PlusCircle className="size-4 text-amber-600" />
                <span className="text-xs">Buat Lomba / Kontes Baru</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelectQuickAction("/liveview")}
                className="gap-2.5 py-2 cursor-pointer"
              >
                <Tv className="size-4 text-red-500" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">Liveview Sirkuit Perjalanan Larasati</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-red-500/40 text-red-500">
                    LIVE
                  </Badge>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

      {items.map((group) => (
        <SidebarGroup key={group.id}>
          {group.label && (
            <SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none">
              {group.label}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isItemActive={isItemActive}
                  isSubItemActive={isSubItemActive}
                  isSubmenuOpen={isSubmenuOpen}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

function NavItem({ item, isItemActive, isSubItemActive, isSubmenuOpen }: NavItemProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsedDesktop = state === "collapsed" && !isMobile;

  if (!hasSubItems(item)) {
    return <NavLinkItem item={item} isActive={isItemActive(item)} showIconFallback={isCollapsedDesktop} />;
  }

  if (isCollapsedDesktop) {
    return <NavDropdownItem item={item} isActive={isItemActive(item)} isSubItemActive={isSubItemActive} />;
  }

  return (
    <NavCollapsibleItem
      item={item}
      isActive={isItemActive(item)}
      defaultOpen={isSubmenuOpen(item)}
      isSubItemActive={isSubItemActive}
    />
  );
}

function NavLinkItem({ item, isActive, showIconFallback }: NavLinkItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          <Link
            to={item.url}
            target={item.newTab ? "_blank" : undefined}
            rel={item.newTab ? "noreferrer" : undefined}
          />
        }
        aria-disabled={item.disabled}
        tooltip={item.title}
        isActive={isActive}
      >
        <NavLinkIcon item={item} showFallback={showIconFallback} />
        <span>{item.title}</span>
      </SidebarMenuButton>
      <NavItemBadge badge={item.badge} />
    </SidebarMenuItem>
  );
}

function NavLinkIcon({ item, showFallback }: NavLinkIconProps) {
  const Icon = item.icon;

  if (Icon) {
    return <Icon />;
  }

  if (showFallback) {
    return <CollapsedIconFallback title={item.title} />;
  }

  return null;
}

function NavDropdownItem({ item, isActive, isSubItemActive }: NavDropdownItemProps) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<SidebarMenuButton tooltip={item.title} isActive={isActive} disabled={item.disabled} />}
        >
          {Icon ? <Icon /> : <CollapsedIconFallback title={item.title} />}
          <span>{item.title}</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start" sideOffset={12} className="w-48">
          <DropdownMenuGroup>
            {item.subItems.map((subItem) => {
              const SubIcon = subItem.icon;

              return (
                <DropdownMenuItem key={subItem.id} render={<Link to={subItem.url} />}>
                  {SubIcon && <SubIcon />}
                  <span>{subItem.title}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function NavCollapsibleItem({ item, isActive, defaultOpen, isSubItemActive }: NavCollapsibleItemProps) {
  const Icon = item.icon;
  const [open, setOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  return (
    <Collapsible
      render={<li data-slot="sidebar-menu-item" data-sidebar="menu-item" className="group/menu-item relative" />}
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} isActive={isActive} disabled={item.disabled} />}
      >
        {Icon && <Icon />}
        <span>{item.title}</span>
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-panel-open/menu-button:rotate-90" />
      </CollapsibleTrigger>
      <NavItemBadge badge={item.badge} />

      <CollapsibleContent>
        <SidebarMenuSub>
          {item.subItems.map((subItem) => {
            const SubIcon = subItem.icon;

            return (
              <SidebarMenuSubItem key={subItem.id}>
                <SidebarMenuSubButton
                  render={
                    <Link
                      to={subItem.url}
                      target={subItem.newTab ? "_blank" : undefined}
                      rel={subItem.newTab ? "noreferrer" : undefined}
                    />
                  }
                  aria-disabled={subItem.disabled}
                  isActive={isSubItemActive(subItem.url)}
                >
                  {SubIcon && <SubIcon />}
                  <span>{subItem.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavItemBadge({ badge }: { badge?: NavBadge }) {
  if (!badge) {
    return null;
  }

  if (badge === "live") {
    return (
      <SidebarMenuBadge
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wider"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-red-500" />
        </span>
        <span>LIVE</span>
      </SidebarMenuBadge>
    );
  }

  return (
    <SidebarMenuBadge
      className={cn(
        "rounded-sm border capitalize",
        badge === "new" &&
        "border-green-600 text-green-600 peer-hover/menu-button:text-green-600 peer-data-active/menu-button:text-green-600",
        badge === "soon" && "border-muted-foreground text-muted-foreground",
      )}
    >
      {badge}
    </SidebarMenuBadge>
  );
}
